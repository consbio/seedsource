from rest_framework import serializers

from .models import RunConfiguration


class RunConfigurationSerializer(serializers.ModelSerializer):
    configuration = serializers.JSONField()

    class Meta:
        model = RunConfiguration
        fields = ('uuid', 'created', 'modified', 'title', 'configuration')
        read_only_fields = ('uuid', 'created', 'modified')
