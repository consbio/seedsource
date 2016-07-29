import asyncio
import json
import math
import os
import sys
from io import BytesIO

import aiohttp
import mercantile
from PIL import Image
from PIL import ImageDraw
from clover.geometry.bbox import BBox
from django.conf import settings
from django.contrib.gis.geos import Point
from django.db.models import Q
from ncdjango.geoimage import world_to_image
from ncdjango.models import Service
from netCDF4 import Dataset
from rest_framework import viewsets
from rest_framework.decorators import detail_route
from rest_framework.exceptions import ParseError
from rest_framework.filters import DjangoFilterBackend
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from seedsource.models import TransferLimit, SeedZone, RunConfiguration
from seedsource.serializers import RunConfigurationSerializer, SeedZoneSerializer, GeneratePDFSerializer
from seedsource.serializers import TransferLimitSerializer

PORT = getattr(settings, 'PORT', '80')
BASE_DIR = settings.BASE_DIR

TILE_SIZE = (256, 256)
IMAGE_SIZE = (900, 600)


class RunConfigurationViewset(viewsets.ModelViewSet):
    queryset = RunConfiguration.objects.all()
    serializer_class = RunConfigurationSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'uuid'

    def get_queryset(self):
        return RunConfiguration.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class SeedZoneViewset(viewsets.ReadOnlyModelViewSet):
    queryset = SeedZone.objects.all()
    serializer_class = SeedZoneSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_fields = ('species',)

    def get_queryset(self):
        if not self.request.query_params.get('point'):
            return self.queryset
        else:
            try:
                x, y = [float(x) for x in self.request.query_params['point'].split(',')]
            except ValueError:
                raise ParseError()
            point = Point(x, y)

            return self.queryset.filter(polygon__intersects=point)

    @detail_route(methods=['get'])
    def geometry(self, *args, **kwargs):
        return Response(json.loads(self.get_object().polygon.geojson))


class TransferLimitViewset(viewsets.ReadOnlyModelViewSet):
    queryset = TransferLimit.objects.all().select_related('zone').defer('zone__polygon')
    serializer_class = TransferLimitSerializer
    filter_backends = (DjangoFilterBackend,)
    filter_fields = ('variable', 'time_period', 'zone_id')

    def _get_elevation_at_point(self, point):
        service = Service.objects.get(name='west1_dem')
        variable = service.variable_set.all().get()

        with Dataset(os.path.join(settings.NC_SERVICE_DATA_ROOT, service.data_path)) as ds:
            data = ds.variables[variable.variable]

            cell_size = (
                float(variable.full_extent.width) / data.shape[1],
                float(variable.full_extent.height) / data.shape[0]
            )

            cell_index = [
                int(float(point.x - variable.full_extent.xmin) / cell_size[0]),
                int(float(point.y - variable.full_extent.ymin) / cell_size[1])
            ]

            y_increasing = data[0][1] > data[0][0]

            if not y_increasing:
                cell_index[1] = data.shape[0] - cell_index[1] - 1

            return data[cell_index[1]][cell_index[0]]

    def get_queryset(self):
        if not self.request.query_params.get('point'):
            return self.queryset
        else:
            try:
                x, y = [float(x) for x in self.request.query_params['point'].split(',')]
            except ValueError:
                raise ParseError()

            elevation = self._get_elevation_at_point(Point(x, y))

            # Elevation bands are stored in feet
            return self.queryset.filter(
                Q(low__lt=elevation/0.3048, high__gte=elevation/0.3048) | Q(low__isnull=True, high__isnull=True)
            )


class GeneratePDFView(GenericAPIView):
    serializer_class = GeneratePDFSerializer

    def _configure_event_loop(self):
        if sys.platform == 'win32':
            asyncio.set_event_loop(asyncio.ProactorEventLoop())
        else:
            asyncio.set_event_loop(asyncio.SelectorEventLoop())

    def _create_map_image(self, size, point, zoom, tile_layers, zone_id):
        self._configure_event_loop()

        num_tiles = [math.ceil(size[x] / TILE_SIZE[x]) + 1 for x in (0, 1)]
        center_tile = mercantile.tile(point[0], point[1], zoom)

        ul_tile = mercantile.Tile(
            x=max(0, center_tile[0] - num_tiles[0] // 2),
            y=max(0, center_tile[1] - num_tiles[1] // 2),
            z=zoom
        )
        lr_tile = mercantile.Tile(
            x=min(zoom**2, ul_tile.x + num_tiles[0]),
            y=min(zoom**2, ul_tile.y + num_tiles[1]),
            z=zoom
        )

        ul = mercantile.xy(*mercantile.ul(*ul_tile))
        lr = mercantile.xy(*mercantile.ul(*lr_tile))

        im = Image.new('RGBA', (TILE_SIZE[0] * num_tiles[0], TILE_SIZE[1] * num_tiles[1]))

        im_bbox = BBox((ul[0], lr[1], lr[0], ul[1]))
        to_image = world_to_image(im_bbox, im.size)

        async def fetch_tile(client, layer_url, tile, im):
            layer_url = layer_url.format(x=tile.x, y=tile.y, z=tile.z, s='server')
            if layer_url.startswith('//'):
                layer_url = 'https:{}'.format(layer_url)
            elif layer_url.startswith('/'):
                layer_url = 'http://127.0.0.1:{}{}'.format(PORT, layer_url)

            async with client.get(layer_url) as r:
                tile_im = Image.open(BytesIO(await r.read()))
                im.paste(tile_im, ((tile.x - ul_tile.x) * 256, (tile.y - ul_tile.y) * 256))

        layer_images = [Image.new('RGBA', im.size) for _ in tile_layers]

        with aiohttp.ClientSession() as client:
            requests = []

            for i in range(num_tiles[0] * num_tiles[1]):
                tile = mercantile.Tile(x=ul_tile.x + i % num_tiles[0], y=ul_tile.y + i // num_tiles[0], z=zoom)

                for j, layer_url in enumerate(tile_layers):
                    requests.append(fetch_tile(client, layer_url, tile, layer_images[j]))

            asyncio.get_event_loop().run_until_complete(asyncio.gather(*requests))

        for image in layer_images:
            im.paste(image, (0, 0), image)

        leaflet_images_dir = os.path.join(BASE_DIR, 'seedsource', 'static', 'leaflet', 'images')
        marker = Image.open(os.path.join(leaflet_images_dir, 'marker-icon.png'))
        shadow = Image.open(os.path.join(leaflet_images_dir, 'marker-shadow.png'))

        point_px = [round(x) for x in to_image(*mercantile.xy(*point))]

        shadow_im = Image.new('RGBA', im.size)
        shadow_im.paste(shadow, (point_px[0] - 12, point_px[1] - shadow.size[1]))
        im.paste(shadow_im, (0, 0), shadow_im)

        marker_im = Image.new('RGBA', im.size)
        marker_im.paste(marker, (point_px[0] - marker.size[0] // 2, point_px[1] - marker.size[1]))
        im.paste(marker_im, (0, 0), marker_im)

        if zone_id is not None:
            geometry = SeedZone.objects.get(pk=zone_id).polygon.coords[0]
            canvas = ImageDraw.Draw(im)

            canvas.line(
                [tuple(round(x) for x in to_image(*mercantile.xy(*p))) for p in geometry], fill=(0, 255, 0), width=3
            )

            del canvas

        im_ul = (point_px[0] - size[0] // 2, point_px[1] - size[1] // 2)
        im = im.crop((*im_ul, im_ul[0] + size[0], im_ul[1] + size[1]))

        return im

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        point = data['configuration']['point']

        if data['configuration']['method'] ==  'seedzone':
            zone_id = data['configuration']['zones']['selected']
        else:
            zone_id = None

        map_image = self._create_map_image(
            IMAGE_SIZE, (point['x'], point['y']), data['zoom'], data['tile_layers'], zone_id
        )

        map_image.save('/Users/nikmolnar/Desktop/test.png')

        return Response()
