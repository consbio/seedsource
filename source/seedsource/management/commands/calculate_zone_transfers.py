import json
import math
import os
from statistics import mean

import numpy
from clover.geometry.bbox import BBox
from clover.netcdf.variable import SpatialCoordinateVariables
from django.conf import settings
from django.core.management import BaseCommand
from django.db import transaction
from ncdjango.models import Service
from netCDF4 import Dataset
from pyproj import Proj
from rasterio.features import rasterize

from seedsource.models import SeedZone, TransferLimit

VARIABLES = (
    'MAT', 'MWMT', 'MCMT', 'TD', 'MAP', 'MSP', 'AHM', 'SHM', 'DD_0', 'DD5', 'FFP', 'PAS', 'EMT', 'EXT', 'Eref', 'CMD'
)


class Command(BaseCommand):
    help = 'Calculates default variable transfer limits for each available seed zone'

    def __init__(self, *args, **kwargs):
        self.transfers_by_source = {}

        return super().__init__(*args, **kwargs)

    def _get_bands_fn(self, source):
        def _every(low, high, increment, start=0):
            """ Returns a generator for zones within low-high based on the increment """

            if high < low:
                return (x for x in [])

            low -= start
            high -= start

            low -= low % increment
            high += increment - high % increment

            return ((x + start, x + increment + start) for x in range(low, high, increment))

        def historical(zone_id, low, high):
            return _every(low, high, 500)

        def wa_psme(zone_id, low, high):
            if zone_id < 13:
                return _every(low, high, 1000)
            elif zone_id < 17:
                return [(0, 1400)] + list(_every(1400, high, 700, 1400))
            else:
                raise ValueError('Unrecognized zone: {}'.format(zone_id))

        def or_psme(zone_id, low, high):
            if zone_id < 4:
                return [(0, 2000), (2000, 2750)] + list(_every(2750, high, 500, 2750))
            elif zone_id == 5:
                return _every(low, high, 500)
            elif zone_id == 4 or zone_id < 17:
                return [(0, 1000)] + list(_every(1000, high, 500, 1000))
            else:
                raise ValueError('Unrecognized zone: {}'.format(zone_id))

        def wa_pico(zone_id, low, high):
            if zone_id < 14:
                return _every(low, high, 1000)
            elif zone_id < 18:
                return _every(low, high, 700)
            else:
                raise ValueError('Unrecognized zone: {}'.format(zone_id))

        def or_pico(zone_id, low, high):
            return _every(low, high, 1000)

        def or_pipo(zone_id, low, high):
            if zone_id == 10:
                return list(_every(low, min(4999, high), 1000)) + list(_every(5000, high, 700, 5000))
            elif zone_id < 16:
                return _every(low, high, 1000)
            else:
                raise ValueError('Unrecognized zone: {}'.format(zone_id))

        def wa_pipo(zone_id, low, high):
            if zone_id < 4:
                return [(0, high + 1)]
            elif zone_id < 12:
                return _every(low, high, 1000)
            else:
                raise ValueError('Unrecognized zone: {}'.format(zone_id))

        def wa_thpl(zone_id, low, high):
            if zone_id < 5:
                return _every(low, high, 2000)
            elif zone_id < 8:
                return _every(low, high, 1500)
            else:
                raise ValueError('Unrecognized zone: {}'.format(zone_id))

        def or_thpl(zone_id, low, high):
            if zone_id < 3:
                return [(0, 999999)]
            elif zone_id < 5:
                return [(0, 3500), (3500, high + 1)]
            else:
                raise ValueError('Unrecognized zone: {}'.format(zone_id))

        def wa_pimo(zone_id, low, high):
            return [(low, high + 1)]

        def or_pimo(zone_id, low, high):
            return [(low, high + 1)]

        return {
            'historic_seed_zones/historic_seed_zones.shp': historical,
            'Oregon_Seed_Zones/Douglas_Fir.shp': or_psme,
            'WA_NEW_ZONES/PSME.shp': wa_psme,
            'Oregon_Seed_Zones/Lodgepole_Pine.shp': or_pico,
            'WA_NEW_ZONES/PICO.shp': wa_pico,
            'Oregon_Seed_Zones/Ponderosa_Pine.shp': or_pipo,
            'WA_NEW_ZONES/PIPO.shp': wa_pipo,
            'Oregon_Seed_Zones/Western_Red_Cedar.shp': or_thpl,
            'WA_NEW_ZONES/THPL.shp': wa_thpl,
            'Oregon_Seed_Zones/Western_White_Pine.shp': or_pimo,
            'WA_NEW_ZONES/PIMO.shp': wa_pimo
        }[source]

    def _get_subsets(self, elevation, data, coords: SpatialCoordinateVariables, bbox):
        """ Returns subsets of elevation, data, and coords, clipped to the given bounds """

        x_slice = slice(*coords.x.indices_for_range(bbox.xmin, bbox.xmax))
        y_slice = slice(*coords.y.indices_for_range(bbox.ymin, bbox.ymax))

        return elevation[y_slice, x_slice], data[y_slice, x_slice], coords.slice_by_bbox(bbox)

    def _write_limit(self, variable, time_period, zone, masked_data, low=None, high=None):
        min_value = numpy.nanmin(masked_data)
        max_value = numpy.nanmax(masked_data)
        transfer = (max_value - min_value) / 2.0
        center = max_value - transfer

        if numpy.isnan(transfer) or hasattr(transfer, 'mask'):
            print('WARNING: Transfer limit is NaN for {}, zone {}, band {}-{}'.format(
                zone.source, zone.zone_id, low, high
            ))
            return

        TransferLimit.objects.create(
            variable=variable, time_period=time_period, zone=zone, transfer=transfer, center=center, low=low, high=high
        )

        transfers_by_variable = self.transfers_by_source.get(zone.source, {})
        transfers_by_variable[variable] = transfers_by_variable.get(variable, []) + [transfer]
        self.transfers_by_source[zone.source] = transfers_by_variable

    def handle(self, *args, **options):
        elevation_service = Service.objects.get(name='west1_dem')
        with Dataset(os.path.join(settings.NC_SERVICE_DATA_ROOT, elevation_service.data_path)) as ds:
            coords = SpatialCoordinateVariables.from_dataset(
                ds, x_name='lon', y_name='lat', projection=Proj(elevation_service.projection)
            )
            elevation = ds.variables['Band1'][:]

        message = 'WARNING: This will replace all your transfer limits. Do you want to continue? [y/n]'
        if input(message).lower() not in {'y', 'yes'}:
            return

        self.transfers_by_source = {}

        with transaction.atomic():
            TransferLimit.objects.all().delete()

            for time_period in ('1961_1990', '1981_2010'):
                for variable in VARIABLES:
                    print('Processing {} for {}...'.format(variable, time_period))

                    variable_service = Service.objects.get(name='west1_{}Y_{}'.format(time_period, variable))
                    with Dataset(os.path.join(settings.NC_SERVICE_DATA_ROOT, variable_service.data_path)) as ds:
                        data = ds.variables[variable][:]

                    for zone in SeedZone.objects.all():
                        clipped_elevation, clipped_data, clipped_coords = self._get_subsets(
                            elevation, data, coords, BBox(zone.polygon.extent)
                        )

                        zone_mask = rasterize(
                            ((json.loads(zone.polygon.geojson), 1),), out_shape=clipped_elevation.shape,
                            transform=clipped_coords.affine, fill=0, dtype=numpy.dtype('uint8')
                        )

                        masked_dem = numpy.ma.masked_where(zone_mask == 0, clipped_elevation)
                        min_elevation = math.floor(numpy.nanmin(masked_dem) / 0.3048)
                        max_elevation = math.ceil(numpy.nanmax(masked_dem) / 0.3048)
                        bands = list(self._get_bands_fn(zone.source)(zone.zone_id, min_elevation, max_elevation))

                        if not bands:
                            print('WARNING: No elevation bands found for {}, zone {}'.format(
                                zone.source, zone.zone_id
                            ))
                            continue

                        for band in bands:
                            low, high = band

                            # Bands are exclusive of the low number, so the first band is a special case, since we
                            # want to include 0. So we work around it by making the actual low -1
                            if low == 0:
                                low = -1

                            # Elevation bands are represented in feet
                            masked_data = numpy.ma.masked_where(
                                (zone_mask == 0) | (clipped_elevation <= low * 0.3048) |
                                (clipped_elevation > high * 0.3048),
                                clipped_data
                            )

                            self._write_limit(variable, time_period, zone, masked_data, low, high)

            for source, transfers_by_variable in self.transfers_by_source.items():
                for variable, transfers in transfers_by_variable.items():
                    TransferLimit.objects.filter(
                        variable=variable, zone__source=source
                    ).update(
                        avg_transfer=mean(transfers)
                    )
