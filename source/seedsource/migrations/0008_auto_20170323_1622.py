# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.contrib.gis.db.models.fields


class Migration(migrations.Migration):

    dependencies = [
        ('seedsource', '0007_region'),
    ]

    operations = [
        migrations.AlterField(
            model_name='seedzone',
            name='polygon',
            field=django.contrib.gis.db.models.fields.GeometryField(geography=True, srid=4326),
        ),
    ]
