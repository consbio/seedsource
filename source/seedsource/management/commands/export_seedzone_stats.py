import errno
import json
import math
import os
import time
from csv import DictWriter

import numpy
from clover.geometry.bbox import BBox
from clover.netcdf.variable import SpatialCoordinateVariables
from django.conf import settings
from django.contrib.gis.geos import Polygon
from django.core.management import BaseCommand
from ncdjango.models import Service
from netCDF4 import Dataset
from pyproj import Proj
from rasterio.features import rasterize

from seedsource.models import SeedZone, Region
from .calculate_zone_transfers import get_bands_fn

VARIABLES = (
    'AHM', 'CMD', 'DD5', 'DD_0', 'EMT', 'Eref', 'EXT', 'FFP', 'MAP', 'MAT', 'MCMT', 'MSP', 'MWMT', 'PAS', 'SHM', 'TD'
)


class Command(BaseCommand):
    help = 'Export seed zone statistics and sample data'

    def add_arguments(self, parser):
        parser.add_argument('output_directory', nargs=1, type=str)

    def _get_subsets(self, elevation, data, coords: SpatialCoordinateVariables, bbox):
        """ Returns subsets of elevation, data, and coords, clipped to the given bounds """

        x_slice = slice(*coords.x.indices_for_range(bbox.xmin, bbox.xmax))
        y_slice = slice(*coords.y.indices_for_range(bbox.ymin, bbox.ymax))

        return elevation[y_slice, x_slice], data[y_slice, x_slice], coords.slice_by_bbox(bbox)

    def _write_row(self, writer, variable, zone_file, zone_id, masked_data, low, high):
        min_value = numpy.nanmin(masked_data)
        max_value = numpy.nanmax(masked_data)
        transfer = (max_value - min_value) / 2.0
        center = max_value - transfer

        nan_data = masked_data.astype(numpy.float32)
        nan_data[masked_data.mask] = numpy.nan
        p5 = numpy.nanpercentile(nan_data, 5)
        p95 = numpy.nanpercentile(nan_data, 95)
        p_transfer = (p95 - p5) / 2.0
        p_center = p95 - p_transfer

        writer.writerow({
            'samples': os.path.join(
                '{}_samples'.format(variable), '{}_zone_{}_{}_{}.txt'.format(zone_file, zone_id, low, high)
            ),
            'zone_file': zone_file,
            'zone': zone_id,
            'band_low': low,
            'band_high': high,
            'median': float(numpy.ma.median(masked_data)),
            'mean': numpy.nanmean(masked_data),
            'min': min_value,
            'max': max_value,
            'transfer': transfer,
            'center': center,
            'p5': p5,
            'p95': p95,
            'p_transfer': p_transfer,
            'p_center': p_center
        })

    def _write_sample(self, output_directory, variable, zone_file, zone_id, masked_data, low, high):
        sample = masked_data.compressed()  # Discard masked values
        numpy.random.shuffle(sample)
        sample = sample[:1000]

        filename = '{}_zone_{}_{}_{}.txt'.format(zone_file, zone_id, low, high).replace('/', '_')

        with open(os.path.join(output_directory, '{}_samples'.format(variable), filename), 'w') as f:
            f.write(','.join(str(x) for x in sample))
            f.write(os.linesep)

    def handle(self, output_directory, *args, **kwargs):
        output_directory = output_directory[0]

        seed = input('Enter random seed (leave blank to auto-generate): ')
        if not seed:
            seed = int(time.time())

        print('Using random seed: {}'.format(int(seed)))
        numpy.random.seed(seed)

        for variable in VARIABLES:
            print('Processing {}...'.format(variable))

            try:
                os.mkdir(os.path.join(output_directory, '{}_samples'.format(variable)))
            except OSError as ex:
                if ex.errno != errno.EEXIST:
                    raise

            with open(os.path.join(output_directory, '{}.csv'.format(variable)), 'w') as f_out:
                writer = DictWriter(
                    f_out, fieldnames=[
                        'samples', 'zone_file', 'zone', 'band_low', 'band_high', 'median', 'mean', 'min', 'max',
                        'transfer',
                        'center', 'p5', 'p95', 'p_transfer', 'p_center'
                    ])
                writer.writeheader()

                last_zone_set = None
                last_region = None

                for zone in SeedZone.objects.all().order_by('source'):
                    if zone.source != last_zone_set:
                        last_zone_set = zone.source
                        region = Region.objects.filter(
                            polygons__intersects=Polygon.from_bbox(zone.polygon.extent)
                        ).first()

                        if region != last_region:
                            last_region = region

                            print('Loading region {}'.format(region.name))

                            elevation_service = Service.objects.get(name='{}_dem'.format(region.name))
                            dataset_path = os.path.join(settings.NC_SERVICE_DATA_ROOT, elevation_service.data_path)

                            with Dataset(dataset_path) as ds:
                                coords = SpatialCoordinateVariables.from_dataset(
                                    ds, x_name='lon', y_name='lat', projection=Proj(elevation_service.projection)
                                )
                                elevation = ds.variables['elevation'][:]

                            variable_service = Service.objects.get(
                                name='{}_1961_1990Y_{}'.format(region.name, variable)
                            )
                            dataset_path = os.path.join(settings.NC_SERVICE_DATA_ROOT, variable_service.data_path)
                            with Dataset(dataset_path) as ds:
                                data = ds.variables[variable][:]

                    clipped_elevation, clipped_data, clipped_coords = self._get_subsets(
                        elevation, data, coords, BBox(zone.polygon.extent)
                    )

                    zone_mask = rasterize(
                        ((json.loads(zone.polygon.geojson), 1),), out_shape=clipped_elevation.shape,
                        transform=clipped_coords.affine, fill=0, dtype=numpy.dtype('uint8')
                    )

                    masked_dem = numpy.ma.masked_where(zone_mask == 0, clipped_elevation)
                    min_elevation = max(math.floor(numpy.nanmin(masked_dem) / 0.3048), 0)
                    max_elevation = math.ceil(numpy.nanmax(masked_dem) / 0.3048)
                    bands = list(get_bands_fn(zone.bands_fn)(zone.zone_id, min_elevation, max_elevation))

                    if bands is None:
                        continue

                    for band in bands:
                        low, high = band

                        # Elevation bands are represented in feet
                        masked_data = numpy.ma.masked_where(
                            (zone_mask == 0) | (clipped_elevation < low * 0.3048) |
                            (clipped_elevation >= high * 0.3048),
                            clipped_data
                        )

                        self._write_row(writer, variable, zone.name, zone.zone_id, masked_data, low, high)
                        self._write_sample(output_directory, variable, zone.name, zone.zone_id, masked_data, low, high)
