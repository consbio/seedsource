# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('seedsource', '0003_transferlimit_center'),
    ]

    operations = [
        migrations.AddField(
            model_name='transferlimit',
            name='time_period',
            field=models.CharField(max_length=10, default='1961_1990'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='seedzone',
            name='species',
            field=models.CharField(max_length=10, default=''),
            preserve_default=False,
        ),
    ]
