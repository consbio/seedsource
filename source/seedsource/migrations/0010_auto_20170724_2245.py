# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('seedsource', '0009_merge'),
    ]

    operations = [
        migrations.AlterField(
            model_name='seedzone',
            name='zone_uid',
            field=models.CharField(unique=True, max_length=50, null=True),
        ),
    ]
