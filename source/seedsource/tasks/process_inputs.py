from ncdjango.geoprocessing.params import DictParameter
from ncdjango.geoprocessing.workflow import Task


class ProcessLimits(Task):
    """Given min/max limits, calculate scoring factors."""

    name = 'sst:process_limits'
    inputs =[DictParameter(name='limits')]
    outputs = [DictParameter('factors')]

    def execute(self, limits):
        factors = []

        for limit in limits:
            half = (limit['max'] - limit['min']) / 2
            midpoint = limit['min'] + half
            factor = 100 / half
            mid_factor = factor * midpoint

            factors.append({'factor': factor, 'mid_factor': mid_factor})

        return factors
