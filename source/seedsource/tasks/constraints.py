import os

import numpy
from django.conf import settings
from ncdjango.models import Service
from netCDF4._netCDF4 import Dataset


class Constraint(object):
    def __init__(self, data, region):
        self.data = data
        self.region = region

    @staticmethod
    def by_name(constraint):
        return {
            'elevation': ElevationConstraint
        }[constraint]

    def apply_constraint(self, **kwargs):
        raise NotImplemented


class ElevationConstraint(Constraint):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.mask = None

    def apply_constraint(self, **kwargs):
        try:
            min_elevation = kwargs['min']
            max_elevation = kwargs['max']
        except KeyError:
            raise ValueError('Missing constraint arguments')

        if self.mask is None:
            service = Service.objects.get(name='{}_dem'.format(self.region))
            with Dataset(os.path.join(settings.NC_SERVICE_DATA_ROOT, service.data_path)) as ds:
                elevation = ds.variables['elevation'][:]

            self.mask = (elevation < min_elevation)
            self.mask |= (elevation > max_elevation)

        return numpy.ma.masked_where(self.mask, self.data)
