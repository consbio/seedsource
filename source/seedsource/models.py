import uuid as uuid
from django.conf import settings
from django.db import models


class RunConfiguration(models.Model):
    uuid = models.UUIDField(default=uuid.uuid4, db_index=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)
    title = models.CharField(max_length=256)
    configuration = models.TextField()

    class Meta:
        index_together = [['owner', 'created'], ['owner', 'title']]
