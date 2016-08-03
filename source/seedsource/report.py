import asyncio
import math
import os
import sys
from base64 import b64encode
from datetime import datetime
from io import BytesIO

import aiohttp
import mercantile
from PIL import Image
from PIL import ImageDraw
from clover.geometry.bbox import BBox
from django.conf import settings
from django.contrib.gis.geos import Point
from django.template.loader import render_to_string
from ncdjango.geoimage import world_to_image
from weasyprint import HTML

from seedsource.models import SeedZone, TransferLimit
from seedsource.utils import get_elevation_at_point
from seedsource.variables import VARIABLE_CONFIG

ALLOWED_HOSTS = getattr(settings, 'ALLOWED_HOSTS')
BASE_DIR = settings.BASE_DIR
PORT = getattr(settings, 'PORT', 80)

TILE_SIZE = (256, 256)
IMAGE_SIZE = (900, 600)

SPECIES_LABELS = {
    'generic': 'Generic',
    'psme': 'Douglas-fir',
    'pico': 'Lodgepole pine',
    'pipo': 'Ponderosa pine',
    'thpl': 'Western redcedar',
    'pimo': 'Wester white pine'
}


class Report(object):
    def __init__(self, configuration, zoom, tile_layers):
        self.configuration = configuration
        self.zoom = zoom
        self.tile_layers = tile_layers

    def get_year(self, climate):
        return climate['time'].replace('_', '-')

    def get_model(self, climate):
        if climate['time'] in {'1961_1990', '1981_2010'}:
            return None
        else:
            return {
                'rcp45': 'RCP 4.5',
                'rcp85': 'RCP 8.5'
            }[climate['model']]

    def get_context_variables(self):
        variables = []
        is_imperial = self.configuration['unit'] == 'imperial'

        for variable in self.configuration['variables']:
            name, value, transfer = variable['name'], variable['value'], variable['transfer']
            config = VARIABLE_CONFIG[name]
            value /= config.multiplier
            transfer /= config.multiplier

            variables.append({
                'label': '{}: {}'.format(variable['name'], config.label),
                'value': round(config.value_to_imperial(value) if is_imperial else value, 2),
                'limit': round(config.transfer_to_imperial(transfer) if is_imperial else transfer, 2),
                'units': config.imperial_label if is_imperial else config.metric_label,
                'modified': variable['transfer'] != variable['defaultTransfer']
            })

        return variables

    def get_context(self):
        point = self.configuration['point']
        elevation = get_elevation_at_point(Point(point['x'], point['y'])) / 0.3048
        method = self.configuration['method']
        objective = self.configuration['objective']
        climates = self.configuration['climate']

        if self.configuration['method'] == 'seedzone':
            zone_id = self.configuration['zones']['selected']
            zone = SeedZone.objects.get(pk=zone_id)
            try:
                limit = zone.transferlimit_set.filter(low__lt=elevation, high__gte=elevation)[:1].get()
                band = [0 if limit.low == -1 else limit.low, limit.high]
            except TransferLimit.DoesNotExist:
                band = None
        else:
            zone_id = None
            zone = None

        map_image = MapImage(IMAGE_SIZE, (point['x'], point['y']), self.zoom, self.tile_layers, zone_id).get_image()
        image_data = BytesIO()
        map_image.save(image_data, 'png')

        return {
            'today': datetime.today(),
            'image_data': b64encode(image_data.getvalue()),
            'objective': 'Find seedlots' if objective == 'seedlots' else 'Find planting sites',
            'location_label': 'Planting site location' if objective == 'seedlots' else 'Seedlot location',
            'point': {'x': round(point['x'], 4), 'y': round(point['y'], 4)},
            'elevation': round(elevation, 2),
            'seedlot_year': self.get_year(climates['seedlot']),
            'site_year': self.get_year(climates['site']),
            'site_model': self.get_model(climates['site']),
            'method': 'Seed Zone' if method == 'seedzone' else 'Custom',
            'species': SPECIES_LABELS[self.configuration['species']] if method == 'seedzone' else None,
            'zone': getattr(zone, 'name', None),
            'band': band,
            'variables': self.get_context_variables(),
        }

    def get_pdf_data(self) -> BytesIO:
        pdf_data = BytesIO()

        HTML(
            BytesIO(render_to_string('pdf/report.html', self.get_context()).encode())
        ).write_pdf(pdf_data)

        return pdf_data


class MapImage(object):
    def __init__(self, size, point, zoom, tile_layers, zone_id):
        self._configure_event_loop()

        self.num_tiles = [math.ceil(size[x] / TILE_SIZE[x]) + 1 for x in (0, 1)]
        center_tile = mercantile.tile(point[0], point[1], zoom)

        self.ul_tile = mercantile.Tile(
            x=max(0, center_tile[0] - self.num_tiles[0] // 2),
            y=max(0, center_tile[1] - self.num_tiles[1] // 2),
            z=zoom
        )
        lr_tile = mercantile.Tile(
            x=min(2 ** zoom, self.ul_tile.x + self.num_tiles[0]),
            y=min(2 ** zoom, self.ul_tile.y + self.num_tiles[1]),
            z=zoom
        )

        ul = mercantile.xy(*mercantile.ul(*self.ul_tile))
        lr = mercantile.xy(*mercantile.ul(*lr_tile))

        self.image_bbox = BBox((ul[0], lr[1], lr[0], ul[1]))
        self.image_size = (TILE_SIZE[0] * self.num_tiles[0], TILE_SIZE[1] * self.num_tiles[1])
        self.to_image = world_to_image(self.image_bbox, self.image_size)
        self.point_px = [round(x) for x in self.to_image(*mercantile.xy(*point))]

        self.target_size = size
        self.point = point
        self.zoom = zoom
        self.tile_layers = tile_layers
        self.zone_id = zone_id

    def _configure_event_loop(self):
        if sys.platform == 'win32':
            asyncio.set_event_loop(asyncio.ProactorEventLoop())
        else:
            asyncio.set_event_loop(asyncio.SelectorEventLoop())

    def get_layer_images(self):
        async def fetch_tile(client, layer_url, tile, im):
            headers = {}

            layer_url = layer_url.format(x=tile.x, y=tile.y, z=tile.z, s='server')
            if layer_url.startswith('//'):
                layer_url = 'https:{}'.format(layer_url)
            elif layer_url.startswith('/'):
                layer_url = 'http://127.0.0.1:{}{}'.format(PORT, layer_url)
                if ALLOWED_HOSTS:
                    headers['Host'] = ALLOWED_HOSTS[0]

            async with client.get(layer_url) as r:
                tile_im = Image.open(BytesIO(await r.read()))
                im.paste(tile_im, ((tile.x - self.ul_tile.x) * 256, (tile.y - self.ul_tile.y) * 256))

        layer_images = [Image.new('RGBA', self.image_size) for _ in self.tile_layers]

        with aiohttp.ClientSession() as client:
            requests = []

            for i in range(self.num_tiles[0] * self.num_tiles[1]):
                tile = mercantile.Tile(
                    x=self.ul_tile.x + i % self.num_tiles[0],
                    y=self.ul_tile.y + i // self.num_tiles[0],
                    z=self.zoom
                )

                for j, layer_url in enumerate(self.tile_layers):
                    requests.append(fetch_tile(client, layer_url, tile, layer_images[j]))

            asyncio.get_event_loop().run_until_complete(asyncio.gather(*requests))

        return layer_images

    def draw_zone_geometry(self, im):
        if self.zone_id is not None:
            geometry = SeedZone.objects.get(pk=self.zone_id).polygon.coords[0]
            canvas = ImageDraw.Draw(im)

            canvas.line(
                [tuple(round(x) for x in self.to_image(*mercantile.xy(*p))) for p in geometry],
                fill=(0, 255, 0),
                width=3
            )

            del canvas

    def get_marker_image(self):
        leaflet_images_dir = os.path.join(BASE_DIR, 'seedsource', 'static', 'leaflet', 'images')
        marker = Image.open(os.path.join(leaflet_images_dir, 'marker-icon.png'))
        shadow = Image.open(os.path.join(leaflet_images_dir, 'marker-shadow.png'))

        im = Image.new('RGBA', self.image_size)
        im.paste(shadow, (self.point_px[0] - 12, self.point_px[1] - shadow.size[1]))

        marker_im = Image.new('RGBA', im.size)
        marker_im.paste(marker, (self.point_px[0] - marker.size[0] // 2, self.point_px[1] - marker.size[1]))
        im.paste(marker_im, (0, 0), marker_im)

        return im

    def crop_image(self, im):
        im_ul = (self.point_px[0] - self.target_size[0] // 2, self.point_px[1] - self.target_size[1] // 2)
        return im.crop((*im_ul, im_ul[0] + self.target_size[0], im_ul[1] + self.target_size[1]))

    def get_image(self) -> Image:
        im = Image.new('RGBA', self.image_size)

        for layer_im in self.get_layer_images():
            im.paste(layer_im, (0, 0), layer_im)

        self.draw_zone_geometry(im)

        marker_im = self.get_marker_image()
        im.paste(marker_im, (0, 0), marker_im)

        return self.crop_image(im)
