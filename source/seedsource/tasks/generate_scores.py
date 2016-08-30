import numpy
from ncdjango.geoprocessing.data import Raster
from ncdjango.geoprocessing.params import ListParameter, RasterParameter, DictParameter
from ncdjango.geoprocessing.workflow import Task


class GenerateScores(Task):
    name = 'sst:generate_scores'
    inputs = [
        ListParameter(RasterParameter(''), 'variables'),
        DictParameter('limits')
    ]
    outputs = [RasterParameter('raster_out')]

    def execute(self, variables, limits):
        factors = []

        for limit in limits:
            half = (limit['max'] - limit['min']) / 2
            midpoint = limit['min'] + half
            factor = 100 / half
            mid_factor = factor * midpoint

            factors.append({'factor': factor, 'mid_factor': mid_factor})

        sum_rasters = None
        sum_masks = None

        for i, data in enumerate(variables):
            mask = data < limits[i]['min']
            mask |= data > limits[i]['max']

            if sum_masks is not None:
                sum_masks |= mask
            else:
                sum_masks = mask

            data = data.view(numpy.ndarray).astype('float32')
            data *= factors[i]['factor']
            data -= factors[i]['mid_factor']
            data **= 2
            data = numpy.floor(data, data)

            if sum_rasters is not None:
                sum_rasters += data
            else:
                sum_rasters = data

        sum_rasters += 0.4
        sum_rasters **= 0.5

        sum_masks |= sum_rasters > 100
        sum_rasters = numpy.ma.masked_where(sum_masks, sum_rasters)

        raster = variables[0]
        return Raster(sum_rasters.astype('int8'), raster.extent, raster.x_dim, raster.y_dim, raster.y_increasing)




