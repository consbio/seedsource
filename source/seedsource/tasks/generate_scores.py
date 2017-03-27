import numpy
from ncdjango.geoprocessing.data import Raster
from ncdjango.geoprocessing.params import ListParameter, RasterParameter, DictParameter, StringParameter
from ncdjango.geoprocessing.workflow import Task
from numpy.ma import is_masked

from seedsource.tasks.constraints import Constraint


class GenerateScores(Task):
    name = 'sst:generate_scores'
    inputs = [
        ListParameter(RasterParameter(''), 'variables'),
        DictParameter('limits'),
        StringParameter('region'),
        DictParameter('constraints', required=False)
    ]
    outputs = [RasterParameter('raster_out')]

    def apply_constraints(self, data, constraints, region):
        if constraints is None:
            return data

        for constraint in constraints:
            name, kwargs = constraint['name'], constraint['args']
            data = Constraint.by_name(name)(data, region).apply_constraint(**kwargs)

        return data

    def execute(self, variables, limits, region, constraints=None):
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
            data = self.apply_constraints(data, constraints, region)
            mask = data.mask if is_masked(data) else numpy.zeros_like(data, 'bool')

            mask |= data < limits[i]['min']
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
        sum_rasters = 100 - sum_rasters.astype('int8')

        raster = variables[0]
        return Raster(sum_rasters.astype('int8'), raster.extent, raster.x_dim, raster.y_dim, raster.y_increasing)




