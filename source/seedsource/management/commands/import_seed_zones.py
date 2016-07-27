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
    'psme': 'PSME.shp',
    'pico': 'PICO.shp',
    'pipo': 'PIPO.shp',
    'thpl': 'THPL.shp',
    'pimo': 'PIMO.shp'
}

OREGON_ZONES = {
    'psme': 'Douglas_Fir.shp',
    'pico': 'Lodgepole_Pine.shp',
    'pipo': 'Ponderosa_Pine.shp',
    'thpl': 'Western_Red_Cedar.shp',
    'pimo': 'Western_White_Pine.shp'
}

SPECIES_NAMES = {
    'psme': 'Douglas-fir',
    'pico': 'Lodgepole pine',
    'pipo': 'Ponderosa pine',
    'thpl': 'Western redcedar',
    'pimo': 'Wester white pine'
}

HISTORIC_ZONES = 'historic_seed_zones.shp'


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

                geometry = transform_geom(shp.crs, {'init': 'EPSG:4326'}, feature['geometry'])
                polygon = Polygon(*[LinearRing(x) for x in geometry['coordinates']])
                SeedZone.objects.create(
                    source=source, name=name.format(zone_id=zone_id, species=SPECIES_NAMES.get(species)),
                    species=species, zone_id=zone_id, polygon=polygon
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

                for species, zone_file in WASHINGTON_ZONES.items():
                    self._add_zones(
                        os.path.join(WASHINGTON_ZONES_DIR, zone_file), 'Washington {species} Zone {zone_id}', species,
                        os.path.join(wa_zones, zone_file), 'ZONE_NO'
                    )

                print('Loading Oregon seed zones...')

                for species, zone_file in OREGON_ZONES.items():
                    self._add_zones(
                        os.path.join(OREGON_ZONES_DIR, zone_file), 'Oregon {species} Zone {zone_id}', species,
                        os.path.join(or_zones, zone_file), 'SZ{}'.format(species).upper()
                    )

                print ('Loading historic seed zones...')

                self._add_zones(
                    os.path.join(HISTORIC_ZONES_DIR, HISTORIC_ZONES), 'Washington / Oregon Historic Zone {zone_id}',
                    'generic', os.path.join(historic_zones, HISTORIC_ZONES), 'SUBJ_FSZ'
                )


        finally:
            try:
                shutil.rmtree(temp_dir)
            except OSError:
                pass
