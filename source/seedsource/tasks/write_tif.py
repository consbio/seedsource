import numpy as np
import numpy.ma as ma
import rasterio
from ncdjango.geoprocessing.data import Raster
from ncdjango.geoprocessing.params import RasterParameter, StringParameter, IntParameter
from ncdjango.geoprocessing.workflow import Task

from django.conf import settings
import os.path
import tempfile


class WriteTIF(Task):
    name = 'write_tif'
    inputs = [
        RasterParameter('variable'),
    ]
    outputs = [StringParameter('filename')]

    def execute(self, variable):
        fd, filename = tempfile.mkstemp(prefix=settings.DATASET_DOWNLOAD_DIR, suffix='.tif')
        os.close(fd)
        ex = variable.extent
        # rasterio's write_mask function doesn't seem to work correctly,
        # so we explicitly set data values to nodata.
        nodata = -9999
        dtype = np.int16
        with rasterio.open(filename, 'w', driver='GTiff',
            height=ex.height, width=ex.width, crs='+proj=latlong',
            count=1, dtype=dtype, nodata=nodata) as dst:
            dst.write(np.where(variable == ma.masked, nodata, variable).view(dtype), 1)
        return filename
