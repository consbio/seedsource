import json
import os

from django.conf import settings
from django.contrib.gis.geos import Point
from ncdjango.models import Service
from netCDF4 import Dataset
from rest_framework import viewsets
from rest_framework.decorators import detail_route
from rest_framework.exceptions import ParseError
from rest_framework.filters import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from seedsource.models import TransferLimit, SeedZone, RunConfiguration
from seedsource.serializers import RunConfigurationSerializer, SeedZoneSerializer
from seedsource.serializers import TransferLimitSerializer


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
    filter_fields = ('variable', 'zone_id')

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
            return self.queryset.filter(low__lte=elevation, high__gt=elevation)
