import asyncio
import json
import math
import os
import sys
from io import BytesIO

import aiohttp
import mercantile
from PIL import Image
from django.conf import settings
from django.contrib.gis.geos import Point
from django.db.models import Q
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

        center_tile = mercantile.tile(point[0], point[1], zoom)
        bounds = mercantile.bounds(*center_tile)
        resolution = (
            TILE_SIZE[0] / (bounds.east - bounds.west),
            TILE_SIZE[1] / (bounds.north - bounds.south)
        )
        num_tiles = [math.ceil(size[x] / TILE_SIZE[x]) for x in (0, 1)]
        image_ul = (point[0] - (size[0] / resolution[0]) // 2, point[1] + (size[1] / resolution[1]) // 2)
        ul_tile = mercantile.tile(*image_ul, zoom)


        async def fetch_tile(client, layer_url, tile, im):
            layer_url = layer_url.format(x=tile.x, y=tile.y, z=tile.z, s='server')
            if layer_url.startswith('//'):
                layer_url = 'https:{}'.format(layer_url)
            elif layer_url.startswith('/'):
                layer_url = 'http://127.0.0.1:{}{}'.format(PORT, layer_url)

            async with client.get(layer_url) as r:
                tile_im = Image.open(BytesIO(await r.read()))
                ul = mercantile.ul(*tile)
                im.paste(tile_im, (
                    round((ul.lng - image_ul[0]) * resolution[0]),
                    round((image_ul[1] - ul.lat) * resolution[1])
                ))

        layer_images = [Image.new('RGBA', size) for _ in tile_layers]

        with aiohttp.ClientSession() as client:
            requests = []

            for i in range(num_tiles[0] * num_tiles[1]):
                tile = mercantile.Tile(x=ul_tile.x + i % num_tiles[0], y=ul_tile.y + i // num_tiles[0], z=zoom)
                print(tile)

                for j, layer_url in enumerate(tile_layers):
                    requests.append(fetch_tile(client, layer_url, tile, layer_images[j]))

            asyncio.get_event_loop().run_until_complete(asyncio.gather(*requests))

        im = Image.new('RGBA', size)
        for image in layer_images:
            im.paste(image, (0, 0), image)

        # Todo: draw zone
        # Todo: draw marker

        return im

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        point = data['configuration']['point']

        map_image = self._create_map_image(IMAGE_SIZE, (point['x'], point['y']), data['zoom'], data['tile_layers'], None)

        map_image.save('/Users/nikmolnar/Desktop/test.png')

        return Response()
