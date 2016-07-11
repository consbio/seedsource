from rest_framework import serializers

from seedsource.fields import GeometryField
from seedsource.models import SeedZone, TransferLimit
from .models import RunConfiguration


class RunConfigurationSerializer(serializers.ModelSerializer):
    configuration = serializers.JSONField()

    class Meta:
        model = RunConfiguration
        fields = ('uuid', 'created', 'modified', 'title', 'configuration')
        read_only_fields = ('uuid', 'created', 'modified')


class SeedZoneSerializer(serializers.ModelSerializer):
    polygon = GeometryField()

    class Meta:
        model = SeedZone
        fields = ('species', 'zone_id', 'polygon')


class TransferLimitSerializer(serializers.ModelSerializer):
    zone = SeedZoneSerializer()

    class Meta:
        model = TransferLimit
        fields = ('variable', 'zone', 'transfer', 'low', 'high')
