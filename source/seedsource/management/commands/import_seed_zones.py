import os
from tempfile import mkdtemp
from zipfile import ZipFile

import shutil

import fiona
from django.contrib.gis.geos import LinearRing
from django.contrib.gis.geos import Polygon
from django.core.management import BaseCommand
from django.db import transaction
from rasterio.warp import transform_geom

from seedsource.models import SeedZone

WASHINGTON_ZONES_DIR = 'WA_NEW_ZONES'
OREGON_ZONES_DIR = 'Oregon_Seed_Zones'
HISTORIC_ZONES_DIR = 'historic_seed_zones'

WASHINGTON_ZONES = {
    'psme': ('PSME.shp', 'Washington (2002) Douglas-fir Zone {zone_id}'),
    'pico': ('PICO.shp', 'Washington (2002) lodgepole pine Zone {zone_id}'),
    'pipo': ('PIPO.shp', 'Washington (2002) ponderosa pine Zone {zone_id}'),
    'thpl': ('THPL.shp', 'Washington (2002) western redcedar Zone {zone_id}'),
    'pimo': ('PIMO.shp', 'Washington (2002) western white pine Zone {zone_id}')
}

OREGON_ZONES = {
    'psme': ('Douglas_Fir.shp', 'Oregon (1996) Douglas-fir Zone {zone_id}'),
    'pico': ('Lodgepole_Pine.shp', 'Oregon (1996) lodgepole pine Zone {zone_id}'),
    'pipo': ('Ponderosa_Pine.shp', 'Oregon (1996) ponderosa pine Zone {zone_id}'),
    'thpl': ('Western_Red_Cedar.shp', 'Oregon (1996) western redcedar Zone {zone_id}'),
    'pimo': ('Western_White_Pine.shp', 'Oregon (1996) western white pine Zone {zone_id}')
}

SPECIES_NAMES = {
    'psme': 'Douglas-fir',
    'pico': 'Lodgepole pine',
    'pipo': 'Ponderosa pine',
    'thpl': 'Western redcedar',
    'pimo': 'Wester white pine'
}

HISTORIC_ZONES = 'historic_seed_zones.shp'

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

    def _add_zones(self, source, name, species, path, zone_field):
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
                    zone_name = name(zone_id, object_id)
                else:
                    zone_name = name.format(zone_id=zone_id, species=SPECIES_NAMES.get(species))

                geometry = transform_geom(shp.crs, {'init': 'EPSG:4326'}, feature['geometry'])
                polygon = Polygon(*[LinearRing(x) for x in geometry['coordinates']])
                SeedZone.objects.create(
                    source=source, name=zone_name, species=species, zone_id=zone_id, polygon=polygon
                )

    def handle(self, zones_file, *args, **options):
        temp_dir = mkdtemp()

        try:
            with ZipFile(zones_file[0]) as zf:
                zf.extractall(temp_dir)

            wa_zones = os.path.join(temp_dir, WASHINGTON_ZONES_DIR)
            or_zones = os.path.join(temp_dir, OREGON_ZONES_DIR)
            historic_zones = os.path.join(temp_dir, HISTORIC_ZONES_DIR)

            message = (
                'WARNING: This will replace all your seed zone records and remove associated transfer limits. '
                'Do you want to continue? [y/n]'
            )
            if input(message).lower() not in {'y', 'yes'}:
                return

            with transaction.atomic():
                SeedZone.objects.all().delete()

                print('Loading Washington seed zones...')

                for species, (zone_file, name) in WASHINGTON_ZONES.items():
                    self._add_zones(
                        os.path.join(WASHINGTON_ZONES_DIR, zone_file), name, species,
                        os.path.join(wa_zones, zone_file), 'ZONE_NO'
                    )

                print('Loading Oregon seed zones...')

                for species, (zone_file, name) in OREGON_ZONES.items():
                    self._add_zones(
                        os.path.join(OREGON_ZONES_DIR, zone_file), name, species, os.path.join(or_zones, zone_file),
                        'SZ{}'.format(species).upper()
                    )

                print('Loading historic seed zones...')

                def get_historic_name(zone_id, object_id):
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

                self._add_zones(
                    os.path.join(HISTORIC_ZONES_DIR, HISTORIC_ZONES), get_historic_name, 'generic',
                    os.path.join(historic_zones, HISTORIC_ZONES), 'SUBJ_FSZ'
                )

        finally:
            try:
                shutil.rmtree(temp_dir)
            except OSError:
                pass
