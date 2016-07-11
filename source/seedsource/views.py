import os

from clover.netcdf.variable import SpatialCoordinateVariables
from django.conf import settings
from django.contrib.gis.geos import Point
from ncdjango.models import Service
from netCDF4 import Dataset
from pyproj import Proj
from rest_framework import viewsets
from rest_framework.exceptions import ParseError
from rest_framework.permissions import IsAuthenticated

from seedsource.models import TransferLimit
from seedsource.serializers import TransferLimitSerializer
from .models import RunConfiguration
from .serializers import RunConfigurationSerializer


class RunConfigurationViewset(viewsets.ModelViewSet):
    queryset = RunConfiguration.objects.all()
    serializer_class = RunConfigurationSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'uuid'

    def get_queryset(self):
        return RunConfiguration.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class TransferLimitViewset(viewsets.ReadOnlyModelViewSet):
    queryset = TransferLimit.objects.all()
    serializer_class = TransferLimitSerializer

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
        try:
            x, y = [float(x) for x in self.request.query_params['point'].split(',')]
            variable = self.request.query_params['variable']
            species = self.request.query_params.get('species')
        except (ValueError, KeyError):
            raise ParseError()

        point = Point(x, y)
        elevation = self._get_elevation_at_point(point)

        qs = self.queryset.filter(zone__polygon__intersects=point, variable=variable, zone__species=species)

        if species:
            qs = qs.filter(low__lte=elevation, high__gt=elevation)

        return qs[:1]

