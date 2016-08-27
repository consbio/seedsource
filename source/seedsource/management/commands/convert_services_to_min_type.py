import os
import shutil
from netCDF4 import Dataset
from tempfile import mkdtemp

import numpy
from clover.netcdf.crs import set_crs
from clover.netcdf.variable import SpatialCoordinateVariables
from django.conf import settings
from django.core.management.base import BaseCommand
from ncdjango.models import Service
from numpy.ma import is_masked

SERVICE_DATA_ROOT = getattr(settings, 'NC_SERVICE_DATA_ROOT', '/var/ncdjango/services/')
DTYPES = ('int8', 'uint8', 'int16', 'uint16', 'int32', 'uint32', 'int64', 'uint64')

class Command(BaseCommand):
    help = 'Converts all existing services to their smallest possible data type'

    def handle(self, *args, **options):
        message = (
            "WARNING: This will update all service data, casting each to it's smallest possible data type. Do you want "
            "to continue? [y/n]"
        )
        if input(message).lower() not in {'y', 'yes'}:
            return

        for service in Service.objects.all():
            if service.variable_set.all().count() > 1:
                print("Skipping service '{}' with more than one variable...".format(service.name))
                continue

            variable = service.variable_set.all().get()
            path = os.path.join(SERVICE_DATA_ROOT, service.data_path)

            tmp_dir = mkdtemp()
            tmp_path = os.path.join(tmp_dir, os.path.basename(service.data_path))

            try:
                with Dataset(path, 'r') as ds:
                    data = ds.variables[variable.variable][:]
                    coords = SpatialCoordinateVariables.from_bbox(service.full_extent, *reversed(data.shape))

                if data.dtype.kind != 'i':
                    print("Ignoring service '{}' with non-int type".format(service.name))
                    continue

                min_value = data.min()
                max_value = data.max()

                dtype = DTYPES[max(
                    DTYPES.index(numpy.min_scalar_type(min_value)), DTYPES.index(numpy.min_scalar_type(max_value))
                )]

                if data.dtype == dtype:
                    print("Service '{}' already has the smallest possible type: {}".format(service.name, dtype))
                    continue

                print("Converting service '{}' to type: {}".format(service.name, dtype))

                with Dataset(tmp_path, 'w', format='NETCDF4') as ds:
                    coords.add_to_dataset(ds, variable.x_dimension, variable.y_dimension)

                    data = data.astype(dtype)
                    fill_value = data.fill_value if is_masked(data) else None
                    data_var = ds.createVariable(
                        variable.variable, dtype, dimensions=(variable.y_dimension, variable.x_dimension),
                        fill_value=fill_value
                    )
                    data_var[:] = data

                    set_crs(ds, variable.variable, service.full_extent.projection)

                os.unlink(path)
                shutil.copy2(tmp_path, path)

            finally:
                try:
                    shutil.rmtree(tmp_dir)
                except OSError:
                    pass

