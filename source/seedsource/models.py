import uuid as uuid
from django.conf import settings
from django.db import models
from django.contrib.gis.db import models as gis_models


class RunConfiguration(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, db_index=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    title = models.CharField(max_length=256)
    configuration = models.TextField()

    class Meta:
        index_together = [['owner', 'created'], ['owner', 'title']]


class SeedZone(gis_models.Model):
    source = models.CharField(max_length=100)
    name = models.CharField(max_length=256)
    species = models.CharField(max_length=10)
    zone_id = models.IntegerField(null=True)
    zone_uid = models.CharField(max_length=20, unique=True, null=True)
    polygon = gis_models.PolygonField(geography=True)


class TransferLimit(models.Model):
    variable = models.CharField(max_length=10)
    time_period = models.CharField(max_length=10)
    zone = models.ForeignKey(SeedZone)
    low = models.IntegerField(null=True)  # Stored in feet
    high = models.IntegerField(null=True)  # Stored in feet
    transfer = models.FloatField()
    avg_transfer = models.FloatField(default=0)
    center = models.FloatField()


class Region(gis_models.Model):
    name = models.CharField(max_length=20)
    polygons = gis_models.MultiPolygonField(geography=True)

