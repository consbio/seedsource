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
    species = models.CharField(max_length=4, null=True)
    zone_id = models.IntegerField(null=True)
    polygon = gis_models.PolygonField(geography=True)


class TransferLimit(models.Model):
    variable = models.CharField(max_length=10)
    zone = models.ForeignKey(SeedZone)
    low = models.IntegerField(null=True)
    high = models.IntegerField(null=True)
    transfer = models.FloatField()
