# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('seedsource', '0005_transferlimit_avg_transfer'),
    ]

    operations = [
        migrations.AddField(
            model_name='seedzone',
            name='zone_uid',
            field=models.CharField(unique=True, null=True, max_length=20),
        ),
    ]
