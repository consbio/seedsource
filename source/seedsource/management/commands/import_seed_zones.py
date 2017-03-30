import json
import os
import shutil
from tempfile import mkdtemp
from zipfile import ZipFile

import fiona
import itertools
from django.contrib.gis.geos import LinearRing
from django.contrib.gis.geos import Polygon, MultiPolygon
from django.core.management import BaseCommand
from django.db import transaction
from django.db.utils import IntegrityError
from rasterio.warp import transform_geom

from seedsource.models import SeedZone

SPECIES_NAMES = {
    'psme': 'Douglas-fir',
    'pico': 'Lodgepole pine',
    'pipo': 'Ponderosa pine',
    'thpl': 'Western redcedar',
    'pimo': 'Western white pine'
}

WA_HISTORIC = {
    11, 12, 30, 201, 202, 211, 212, 221, 222, 231, 222, 231, 232, 240, 401, 402, 403, 411, 412, 421, 422, 430, 440,
    600, 611, 612, 613, 614, 621, 622, 631, 641, 642, 651, 652, 653, 801, 802, 803, 804, 811, 812, 813, 821, 822, 830,
    841, 842, 851
}
OR_HISTORIC = {
    51, 52, 53, 61, 62, 71, 72, 81, 82, 90, 251, 252, 261, 262, 270, 321, 451, 452, 461, 462, 463, 471, 472, 473, 481,
    482, 483, 491, 492, 493, 501, 502, 511, 512, 661, 662, 671, 672, 673, 674, 675, 681, 682, 690, 701, 702, 703, 711,
    712, 713, 721, 722, 731, 751, 853, 862, 863, 871, 872, 881, 882, 883, 891, 892, 901, 902, 911, 912, 921, 922, 930,
    941, 942, 943, 952
}
WA_OR_HISTORIC = {41, 42, 852, 861}


class Command(BaseCommand):
    help = 'Loads polygon data from seed zone shape files into the database'

    def add_arguments(self, parser):
        parser.add_argument('zones_file', nargs=1, type=str)

    def _add_zones(self, source, name, uid, species, path, zone_field, bands_fn):
        with fiona.open(path, 'r') as shp:
            for feature in shp:
                try:
                    zone_id = feature['properties'][zone_field]
                except KeyError:
                    zone_id = feature['properties'][zone_field.lower()]

                if zone_id is None:
                    continue

                zone_id = int(zone_id)

                if zone_id == 0:
                    continue

                if hasattr(name, '__call__'):
                    object_id = feature['properties'].get('OBJECTID')
                    zone_name = name(zone_id, object_id, feature)
                else:
                    zone_name = name.format(
                        zone_id=zone_id,
                        species=SPECIES_NAMES.get(species),
                        **{
                            k.lower(): v for k, v in feature['properties'].items()
                            if k.lower() not in {'zone_id', 'species'}
                        }
                    )

                geometry = transform_geom(shp.crs, {'init': 'EPSG:4326'}, feature['geometry'])

                if feature['geometry']['type'] == 'MultiPolygon':
                    polygon = MultiPolygon(
                        *[Polygon(*[LinearRing(x) for x in g]) for g in geometry['coordinates']]
                    )
                else:
                    polygon = Polygon(*[LinearRing(x) for x in geometry['coordinates']])

                uid_suffix = 0

                while True:
                    zone_uid = uid.format(zone_id=zone_id)

                    if uid_suffix > 0:
                        zone_uid += '_{}'.format(uid_suffix)

                    try:
                        with transaction.atomic():
                            SeedZone.objects.create(
                                source=source, name=zone_name, species=species, zone_id=zone_id, zone_uid=zone_uid,
                                polygon=polygon, bands_fn=bands_fn
                            )
                        break
                    except IntegrityError:
                        if uid_suffix > 10:
                            raise

                        uid_suffix += 1

    def _get_historic_name(self, zone_id, object_id, feature):
        # Special case: there are two zone 842s: one in WA and the other in OR
        if zone_id == 842:
            if object_id == 28:
                state = 'Washington'
            else:
                state = 'Oregon'

        elif zone_id in WA_HISTORIC:
            state = 'Washington'
        elif zone_id in OR_HISTORIC:
            state = 'Oregon'
        elif zone_id in WA_OR_HISTORIC:
            state = 'Oregon & Washington'
        else:
            raise ValueError('Could not find state for zone {}'.format(zone_id))

        return '{} (1966/1973) Zone {:03d}'.format(state, zone_id)

    def handle(self, zones_file, *args, **options):
        temp_dir = mkdtemp()

        zones_file = zones_file[0]

        try:
            with ZipFile(zones_file) as zf:
                zf.extractall(temp_dir)

            with open(os.path.join(temp_dir, 'config.json'), 'r') as f:
                config = json.loads(f.read())

            message = (
                'WARNING: This will replace {} seed zone records and remove associated transfer limits. '
                'Do you want to continue? [y/n]'.format(config['label'])
            )
            if input(message).lower() not in {'y', 'yes'}:
                return

            with transaction.atomic():
                SeedZone.objects.filter(source__startswith=config['dir']).delete()

                print('Loading {} seed zones...'.format(config['label']))

                zones = os.path.join(temp_dir, config['dir'])

                for species, props in config['species'].items():
                    zone_file = props['file']
                    name = props['label']
                    uid = props['name']
                    col_name = props['column']
                    bands_fn = props['bands_fn']

                    if not name:
                        name = getattr(self, '_get_{}_name'.format(config['label'].lower()))

                    self._add_zones(
                        os.path.join(config['dir'], zone_file), name, uid, species,
                        os.path.join(zones, zone_file), col_name, bands_fn
                    )

        finally:
            try:
                shutil.rmtree(temp_dir)
            except OSError:
                pass
