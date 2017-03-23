# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('seedsource', '0007_region'),
    ]

    operations = [
        migrations.AddField(
            model_name='seedzone',
            name='bands_fn',
            field=models.CharField(null=True, max_length=30),
        ),
    ]
