# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models
import django.contrib.gis.db.models.fields


class Migration(migrations.Migration):

    dependencies = [
        ('seedsource', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='SeedZone',
            fields=[
                ('id', models.AutoField(auto_created=True, serialize=False, primary_key=True, verbose_name='ID')),
                ('source', models.CharField(max_length=100)),
                ('species', models.CharField(null=True, max_length=4)),
                ('zone_id', models.IntegerField(null=True)),
                ('polygon', django.contrib.gis.db.models.fields.PolygonField(geography=True, srid=4326)),
            ],
        ),
        migrations.CreateModel(
            name='TransferLimit',
            fields=[
                ('id', models.AutoField(auto_created=True, serialize=False, primary_key=True, verbose_name='ID')),
                ('variable', models.CharField(max_length=10)),
                ('low', models.IntegerField(null=True)),
                ('high', models.IntegerField(null=True)),
                ('transfer', models.FloatField()),
                ('zone', models.ForeignKey(to='seedsource.SeedZone')),
            ],
        ),
    ]
