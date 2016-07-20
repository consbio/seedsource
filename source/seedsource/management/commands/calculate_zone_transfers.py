import json
import os

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

ELEVATION_BANDS = {
    'Oregon_Seed_Zones/Douglas_Fir.shp': {
        1: {
            'bands': [
                [0, 2000],
                [2000, 2750],
                [2750, 3250],
                [3250, 3750]
            ]
        },
        2: {
            'bands': [
                [0, 2000],
                [2000, 2750],
                [2750, 3250],
                [3250, 3750],
                [3750, 4250]
            ],

        },
        3: {
            'bands': [
                [0, 2000],
                [2000, 2750],
                [2750, 3250],
                [3250, 3750],
                [3750, 4250],
                [4250, 4750]
            ]
        },
        4: {
            'bands': [
                [0, 1000],
                [1000, 1500],
                [1500, 2000]
            ],
        },
        5: {
            'bands': [
                [0, 500],
                [500, 1000],
                [1000, 1500]
            ]
        },
        6: {
            'bands': [
                [0, 1000],
                [1000, 1500],
                [1500, 2000]
            ]
        },
        7: {
            'bands': [
                [0, 1000],
                [1000, 1500],
                [1500, 2000],
                [2000, 2500]
            ]
        },
        8: {
            'bands': [
                [0, 1000],
                [1000, 1500],
                [1500, 2000],
                [2000, 2500]
            ]
        },
        9: {
            'bands': [
                [0, 1000],
                [1000, 1500],
                [1500, 2000],
                [2000, 2500],
                [2500, 3000]
            ]
        },
        10: {
            'bands': [
                [0, 1000],
                [1000, 1500],
                [1500, 2000],
                [2000, 2500],
                [2500, 3000],
                [3000, 3500]
            ]
        },
        11: {
            'bands': [
                [0, 1000],
                [1000, 1500],
                [1500, 2000],
                [2000, 2500],
                [2500, 3000]
            ]
        },
        12: {
            'bands': [
                [1000, 1500],
                [1500, 2000],
                [2000, 2500],
                [2500, 3000],
                [3000, 3500]
            ]
        },
        13: {
            'bands': [
                [2000, 2500],
                [2500, 3000],
                [3000, 3500]
            ]
        },
        14: {
            'bands': [
                [0, 1000],
                [1000, 1500],
                [1500, 2000],
                [2000, 2500],
                [2500, 3000],
                [3000, 3500]
            ]
        },
        15: {
            'bands': [
                [1500, 2000],
                [2000, 2500],
                [2500, 3000],
                [3000, 3500]
            ]
        },
        16: {
            'bands': [
                [1000, 1500],
                [1500, 2000],
                [2000, 2500],
                [2500, 3000],
                [3000, 3500]
            ]
        }
    },
    'WA_NEW_ZONES/PSME.shp': {
        1: {
            'bands': [
                [0, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000]
            ]
        },
        2: {
            'bands': [
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 6000],
                [6000, 7000]
            ]
        },
        3: {
            'bands': [
                [0, 1000],
                [1000, 2000],
                [2000, 3000]
            ]
        },
        4: {
            'bands': [
                [0, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000]
            ]
        },
        5: {
            'bands': [
                [0, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000]
            ]
        },
        6: {
            'bands': [
                [0, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000]
            ]
        },
        7: {
            'bands': [
                [0, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 6000]
            ]
        },
        8: {
            'bands': [
                [0, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 6000]
            ]
        },
        9: {
            'bands': [
                [0, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 6000]
            ]
        },
        10: {
            'bands': [
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 6000],
                [6000, 7000],
                [7000, 8000]
            ]
        },
        11: {
            'bands': [
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 6000],
                [6000, 7000]
            ]
        },
        12: {
            'bands': [
                [0, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 6000]
            ]
        },
        13: {
            'bands': [
                [0, 1400],
                [1400, 2100],
                [2100, 2800],
                [2800, 3500],
                [3500, 4200],
                [4200, 4900],
                [4900, 999999]
            ]
        },
        14: {
            'bands': [
                [0, 1400],
                [1400, 2100],
                [2100, 2800],
                [2800, 3500],
                [3500, 4200],
                [4200, 4900],
                [4900, 999999]
            ]
        },
        15: {
            'bands': [
                [0, 1400],
                [1400, 2100],
                [2100, 2800],
                [2800, 3500],
                [3500, 4200],
                [4200, 4900],
                [4900, 999999]
            ]
        },
        16: {
            'bands': [
                [0, 1400],
                [1400, 2100],
                [2100, 2800],
                [2800, 3500],
                [3500, 4200],
                [4200, 4900],
                [4900, 999999]
            ]
        }
    },
    'Oregon_Seed_Zones/Lodgepole_Pine.shp': {
        1: {
            'bands': [
                [-1, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 6000]
            ]
        },
        2: {
            'bands': [
                [-1, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 6000]
            ]
        },
        3: {
            'bands': [
                [-1, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 6000]
            ]
        },
        4: {
            'bands': [
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 6000]
            ]
        },
        5: {
            'bands': [
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 6000]
            ]
        },
        6: {
            'bands': [
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 6000]
            ]
        },
        7: {
            'bands': []  # No bands provided by Brad
        }
    },
    'WA_NEW_ZONES/PICO.shp': {
        1: {
            'bands': [
                [0, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000]
            ]
        },
        2: {
            'bands': [
                [0, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000]
            ]
        },
        3: {
            'bands': [
                [0, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000]
            ]
        },
        4: {
            'bands': [
                [0, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000]
            ]
        },
        5: {
            'bands': [
                [0, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000]
            ]
        },
        6: {
            'bands': [
                [0, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000]
            ]
        },
        7: {
            'bands': [
                [0, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000]
            ]
        },
        8: {
            'bands': [
                [0, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 999999]
            ]
        },
        9: {
            'bands': [
                [0, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 999999]
            ]
        },
        10: {
            'bands': [
                [0, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 999999]
            ]
        },
        11: {
            'bands': [
                [0, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 999999]
            ]
        },
        12: {
            'bands': [
                [0, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 999999]
            ]
        },
        13: {
            'bands': [
                [0, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 999999]
            ]
        },
        14: {
            'bands': [
                [1999, 2700],
                [2700, 3400],
                [3400, 4100],
                [4100, 4800],
                [4800, 5500],
                [5500, 6100],
                [6100, 999999]
            ]
        },
        15: {
            'bands': [
                [1999, 2700],
                [2700, 3400],
                [3400, 4100],
                [4100, 4800],
                [4800, 5500],
                [5500, 6100],
                [6100, 999999]
            ]
        },
        16: {
            'bands': [
                [1999, 2700],
                [2700, 3400],
                [3400, 4100],
                [4100, 4800],
                [4800, 5500],
                [5500, 6100],
                [6100, 999999]
            ]
        },
        17: {
            'bands': [
                [1999, 2700],
                [2700, 3400],
                [3400, 4100],
                [4100, 4800],
                [4800, 5500],
                [5500, 6100],
                [6100, 999999]
            ]
        }
    },
    'Oregon_Seed_Zones/Ponderosa_Pine.shp': {
        1: {
            'bands': [
                [-1, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 6000]
            ]
        },
        2: {
            'bands': [
                [-1, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 6000]
            ]
        },
        3: {
            'bands': [
                [-1, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 6000]
            ]
        },
        4: {
            'bands': [
                [-1, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 6000]
            ]
        },
        5: {
            'bands': [
                [-1, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 6000]
            ]
        },
        6: {
            'bands': [
                [-1, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 6000]
            ]
        },
        7: {
            'bands': [
                [-1, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 6000]
            ]
        },
        8: {
            'bands': [
                [-1, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 6000]
            ]
        },
        9: {
            'bands': [
                [-1, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 6000]
            ]
        },
        10: {
            'bands': [
                [-1, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 5700],
                [5700, 6400]
            ]
        },
        11: {
            'bands': [
                [-1, 2000]
            ]
        },
        12: {
            'bands': [
                [-1, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 6000]
            ]
        },
        13: {
            'bands': [
                [-1, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 6000]
            ]
        },
        14: {
            'bands': [
                [-1, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 6000]
            ]
        },
        15: {
            'bands': [
                [-1, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000],
                [5000, 6000]
            ]
        }
    },
    'WA_NEW_ZONES/PIPO.shp': {
        1: {
            'bands': [
                [0, 999999]
            ]
        },
        2: {
            'bands': [
                [0, 999999]
            ]
        },
        3: {
            'bands': [
                [0, 999999]
            ]
        },
        4: {
            'bands': [
                [-1, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000]
            ]
        },
        5: {
            'bands': [
                [-1, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000]
            ]
        },
        6: {
            'bands': [
                [-1, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000]
            ]
        },
        7: {
            'bands': [
                [-1, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000]
            ]
        },
        8: {
            'bands': [
                [-1, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000]
            ]
        },
        9: {
            'bands': [
                [-1, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000]
            ]
        },
        10: {
            'bands': [
                [-1, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000]
            ]
        },
        11: {
            'bands': [
                [-1, 1000],
                [1000, 2000],
                [2000, 3000],
                [3000, 4000],
                [4000, 5000]
            ]
        }
    },
    'Oregon_Seed_Zones/Western_Red_Cedar.shp': {
        1: {
            'bands': [
                [-1, 999999]
            ]
        },
        2: {
            'bands': [
                [-1, 999999]
            ]
        },
        3: {
            'bands': [
                [1999, 3500],
                [3500, 999999]
            ]
        },
        4: {
            'bands': [
                [1999, 3500],
                [3500, 999999]
            ]
        }
    },
    'WA_NEW_ZONES/THPL.shp': {
        1: {
            'bands': [
                [-1, 2000],
                [2000, 4000],
                [4000, 6000],
                [6000, 999999]
            ]
        },
        2: {
            'bands': [
                [-1, 2000],
                [2000, 4000],
                [4000, 6000],
                [6000, 999999]
            ]
        },
        3: {
            'bands': [
                [-1, 2000],
                [2000, 4000],
                [4000, 6000],
                [6000, 999999]
            ]
        },
        4: {
            'bands': [
                [-1, 2000],
                [2000, 4000],
                [4000, 6000],
                [6000, 999999]
            ]
        },
        5: {
            'bands': [
                [-1, 1500],
                [1500, 3000],
                [3000, 4500],
                [4500, 6000],
                [6000, 999999]
            ]
        },
        6: {
            'bands': [
                [-1, 1500],
                [1500, 3000],
                [3000, 4500],
                [4500, 6000],
                [6000, 999999]
            ]
        },
        7: {
            'bands': [
                [-1, 1500],
                [1500, 3000],
                [3000, 4500],
                [4500, 6000],
                [6000, 999999]
            ]
        }
    },
    'Oregon_Seed_Zones/Western_White_Pine.shp': {
        1: {
            'bands': [
                [-1, 999999]
            ]
        },
        2: {
            'bands': [
                [-1, 999999]
            ]
        },
        3: {
            'bands': [
                [-1, 999999]
            ]
        },
        4: {
            'bands': [
                [-1, 999999]
            ]
        },
        5: {
            'bands': [
                [-1, 999999]
            ]
        },
        6: {
            'bands': [
                [-1, 999999]
            ]
        }
    },
    'WA_NEW_ZONES/PIMO.shp': {
        1: {
            'bands': [
                [-1, 999999]
            ]
        },
        2: {
            'bands': [
                [-1, 999999]
            ]
        },
        3: {
            'bands': [
                [-1, 999999]
            ]
        },
        4: {
            'bands': [
                [-1, 999999]
            ]
        },
        5: {
            'bands': [
                [-1, 999999]
            ]
        },
        6: {
            'bands': [
                [-1, 999999]
            ]
        },
        7: {
            'bands': [
                [-1, 999999]
            ]
        }
    }
}

VARIABLES = (
    'AHM', 'bFFP', 'CMD', 'DD_0', 'DD_18', 'DD5', 'DD18', 'eFFP', 'EMT', 'Eref', 'EXT', 'FFP', 'MAP', 'MAT',
    'MCMT', 'MSP', 'MWMT', 'NFFD', 'PAS', 'RH', 'SHM', 'TD'
)


class Command(BaseCommand):
    help = 'Calculates default variable transfer limits for each available seed zone'

    def _get_subsets(self, elevation, data, coords: SpatialCoordinateVariables, bbox):
        """ Returns subsets of elevation, data, and coords, clipped to the given bounds """

        x_slice = slice(*coords.x.indices_for_range(bbox.xmin, bbox.xmax))
        y_slice = slice(*coords.y.indices_for_range(bbox.ymin, bbox.ymax))

        return elevation[y_slice, x_slice], data[y_slice, x_slice], coords.slice_by_bbox(bbox)

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

                        if zone.species != 'generic':
                            bands = ELEVATION_BANDS[zone.source].get(zone.zone_id)

                            if bands is None:
                                print('WARNING: No elevation bands found for {}, zone {}'.format(
                                    zone.source, zone.zone_id
                                ))
                                continue

                            bands = bands['bands']

                            for band in bands:
                                low, high = band

                                masked_data = numpy.ma.masked_where(
                                    (zone_mask == 0) | (clipped_elevation < low) | (clipped_elevation >= high),
                                    clipped_data
                                )
                                transfer = (numpy.nanmax(masked_data) - numpy.nanmin(masked_data)) / 2.0
                                center = numpy.nanmax(masked_data) - transfer

                                if numpy.isnan(transfer) or hasattr(transfer, 'mask'):
                                    print('WARNING: Transfer limit is NaN for {}, zone {}, band {}-{}'.format(
                                        zone.source, zone.zone_id, low, high
                                    ))
                                    continue

                                TransferLimit.objects.create(
                                    variable=variable, zone=zone, low=low, high=high, transfer=transfer, center=center
                                )
                        else:
                            masked_data = numpy.ma.masked_where(zone_mask == 0, clipped_data)
                            transfer = (numpy.nanmax(masked_data) - numpy.nanmin(masked_data)) / 2.0
                            center = numpy.nanmax(masked_data) - transfer

                            assert not (numpy.isnan(transfer) or hasattr(transfer, 'mask'))

                            TransferLimit.objects.create(
                                variable=variable, time_period=time_period, zone=zone, transfer=transfer, center=center
                            )
