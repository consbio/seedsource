# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('seedsource', '0004_auto_20160719_0119'),
    ]

    operations = [
        migrations.AddField(
            model_name='transferlimit',
            name='avg_transfer',
            field=models.FloatField(default=0),
        ),
    ]
