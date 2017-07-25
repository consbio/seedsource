import numpy as np
import numpy.ma as ma
import rasterio
from ncdjango.geoprocessing.params import StringParameter
from ncdjango.geoprocessing.workflow import Task
from ncdjango.models import Service, Variable, SERVICE_DATA_ROOT
from django.conf import settings
import os.path
import tempfile
import netCDF4


class WriteTIF(Task):
    name = 'write_tif'
    inputs = [
        StringParameter('uuid'),
    ]
    outputs = [StringParameter('filename')]

    def execute(self, uuid):
        svc_name = uuid + '/raster_out'
        svc = Service.objects.get(name=svc_name)
        var = Variable.objects.get(service_id=svc.id)
        data_path = svc.data_path
        with netCDF4.Dataset(os.path.join(SERVICE_DATA_ROOT, data_path), 'r') as nc:
            data = nc.variables[var.name][:]

        height, width = data.shape
        ex = var.full_extent
        x_step = (ex.xmax - ex.xmin) / width
        y_step = (ex.ymax - ex.ymin) / height
        transform = [ex.xmin, x_step, 0, ex.ymax, 0, -y_step]
        dtype = np.int16
        nodata = -9999

        fd, filename = tempfile.mkstemp(prefix=settings.DATASET_DOWNLOAD_DIR, suffix='.tif')
        os.close(fd)
        with rasterio.Env(GDAL_TIFF_INTERNAL_MASK=True) as env:
            with rasterio.open(filename, 'w', driver='GTiff',
              height=height, width=width,
              crs=var.projection, transform=transform,
              count=1, dtype=dtype, nodata=nodata) as dst:
                dst.write(np.array(data, dtype=dtype), 1)
                dst.write_mask(np.logical_not(data.mask))

        return filename
