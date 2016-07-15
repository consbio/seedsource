# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('seedsource', '0002_seedzone_transferlimit'),
    ]

    operations = [
        migrations.AddField(
            model_name='transferlimit',
            name='center',
            field=models.FloatField(default=0),
            preserve_default=False,
        ),
    ]
