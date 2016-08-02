from django.contrib.gis.geos import Point
from rest_framework import serializers
from rest_framework.exceptions import ParseError

from seedsource.models import SeedZone, TransferLimit
from seedsource.utils import get_elevation_at_point
from .models import RunConfiguration


class RunConfigurationSerializer(serializers.ModelSerializer):
    configuration = serializers.JSONField()

    class Meta:
        model = RunConfiguration
        fields = ('uuid', 'created', 'modified', 'title', 'configuration')
        read_only_fields = ('uuid', 'created', 'modified')


class SeedZoneSerializer(serializers.ModelSerializer):
    elevation_at_point = serializers.SerializerMethodField()
    elevation_band = serializers.SerializerMethodField()

    _elevation = None

    class Meta:
        model = SeedZone
        fields = ('id', 'name', 'species', 'zone_id', 'elevation_at_point', 'elevation_band')

    @property
    def _elevation_at_point(self):
        if self._elevation is None:
            request = self.context['request']

            if not request.query_params.get('point'):
                return None
            else:
                try:
                    x, y = [float(x) for x in request.query_params['point'].split(',')]
                except ValueError:
                    raise ParseError()

                point = Point(x, y)
                self._elevation = get_elevation_at_point(point)

        return self._elevation

    def get_elevation_at_point(self, obj):
        return self._elevation_at_point

    def get_elevation_band(self, obj: SeedZone):
        elevation = self._elevation_at_point / 0.3048  # Elevation bands are stored in feet, elevation is in meters

        try:
            transfer = obj.transferlimit_set.filter(low__lt=elevation, high__gte=elevation)[:1].get()
        except TransferLimit.DoesNotExist:
            return None

        return [0 if transfer.low == -1 else transfer.low, transfer.high]


class TransferLimitSerializer(serializers.ModelSerializer):
    zone = SeedZoneSerializer()

    class Meta:
        model = TransferLimit
        fields = ('variable', 'zone', 'transfer', 'avg_transfer', 'center', 'low', 'high', 'time_period')


class GeneratePDFSerializer(serializers.Serializer):
    configuration = serializers.DictField()
    tile_layers = serializers.ListField(child=serializers.CharField())
    zoom = serializers.IntegerField()
