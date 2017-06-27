import numpy as np
import rasterio
from ncdjango.geoprocessing.data import Raster
from ncdjango.geoprocessing.params import RasterParameter, StringParameter, IntParameter
from ncdjango.geoprocessing.workflow import Task

from seedsource_project import settings
import os.path
import tempfile


class WriteTif(Task):
    name = 'write_tif'
    inputs = [
        RasterParameter('variable'),
    ]
    outputs = [StringParameter('filename')]

    def execute(self, variable):
        fd, filename = tempfile.mkstemp(prefix=settings.NC_TEMPORARY_FILE_LOCATION, suffix='.tif')
        os.close(fd)
        ex = variable.extent
        height = ex.ymax - ex.ymin
        width = ex.xmax - ex.xmin
        with rasterio.open(filename, 'w', driver='GTiff',
          height=height, width=width, crs='+proj=latlong',
          count=1, dtype=np.float32, nodata=-9999) as dst:
            dst.write(variable.view(np.ndarray).astype('float32'), 1)
        return filename
