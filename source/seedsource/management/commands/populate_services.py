import os
import numpy
import pyproj
from clover.geometry.bbox import BBox
from clover.render.renderers.stretched import StretchedRenderer
from clover.utilities.color import Color
from django.db import transaction
from django.core.management.base import BaseCommand
from ncdjango.models import Service, Variable
from netCDF4 import Dataset

# TODO - add 'resume' capability for missing or new services

VARS = (
    'MAT', 'MWMT', 'MCMT', 'TD', 'MAP', 'MSP', 'AHM', 'SHM', 'DD_0', 'DD5', 'FFP', 'PAS', 'EMT', 'EXT', 'Eref', 'CMD'
)
YEARS = ('1961_1990', '1981_2010', 'rcp45_2025', 'rcp45_2055', 'rcp45_2085', 'rcp85_2025', 'rcp85_2055', 'rcp85_2085')
WGS84 = '+proj=latlong +datum=WGS84 +no_defs'


class Command(BaseCommand):
    help = 'Populates a region\'s services with a DEM and ClimateNA clipped to the region.'

    def add_arguments(self, parser):
        parser.add_argument('region_name', nargs=1, type=str)

    def handle(self, region_name, *args, **options):
        name = region_name[0]

        from django.conf import settings
        BASE_DIR = settings.NC_SERVICE_DATA_ROOT

        # determine extent and lat/lon variable names from DEM
        dem_path = os.path.join(BASE_DIR, 'regions', name, '{}_dem.nc'.format(name))
        with Dataset(dem_path, 'r') as ds:
            dims = ds.dimensions.keys()
            lat = 'lat' if 'lat' in dims else 'latitude'
            lon = 'lon' if 'lon' in dims else 'longitude'
            l = float(ds.variables[lon][:].min())
            b = float(ds.variables[lat][:].min())
            r = float(ds.variables[lon][:].max())
            t = float(ds.variables[lat][:].max())
            extent = BBox((l, b, r, t), projection=pyproj.Proj(WGS84))

        # Generate DEM service
        with transaction.atomic():
            print('Adding {}'.format(name))
            print('---')
            print('elevation')
            service_name = '{}_dem'.format(name)
            if not Service.objects.filter(name__iexact=service_name).exists():

                dem_service = Service.objects.create(
                    name=service_name,
                    data_path='regions/{name}/{name}_dem.nc'.format(name=name),
                    projection=WGS84,
                    full_extent=extent,
                    initial_extent=extent
                )
                with Dataset(dem_path, 'r') as ds:
                    v_min = numpy.nanmin(ds.variables['elevation'][:]).item()
                    v_max = numpy.nanmax(ds.variables['elevation'][:]).item()
                    renderer = StretchedRenderer([(v_min, Color(0, 0, 0)), (v_max, Color(255, 255, 255))])
                    variable = Variable.objects.create(
                        service=dem_service,
                        index=0,
                        variable='elevation',
                        projection=WGS84,
                        x_dimension=lon,
                        y_dimension=lat,
                        name='elevation',
                        renderer=renderer,
                        full_extent=extent
                    )
            else:
                print('{} already exists, skipping.'.format(service_name))

        # Generate ClimateNA services
        with transaction.atomic():
            for year in YEARS:

                # Bandaid fix for missing 1981_2010 data for ne1, remove when available
                if name == 'ne1' and year == '1981_2010':
                    continue

                print(year)
                print('---')
                for var in VARS:
                    print(var)

                    service_name = '{}_{}Y_{}'.format(name, year, var)
                    if not Service.objects.filter(name__iexact=service_name).exists():
                        service = Service.objects.create(
                            name=service_name,
                            data_path='regions/{name}/{year}Y/{name}_{year}Y_{var}.nc'.format(
                                name=name, year=year, var=var
                            ),
                            projection=WGS84,
                            full_extent=extent,
                            initial_extent=extent
                        )

                        with Dataset(os.path.join(BASE_DIR, service.data_path), 'r') as ds:
                            dims = ds.dimensions.keys()
                            lat = 'lat' if 'lat' in dims else 'latitude'
                            lon = 'lon' if 'lon' in dims else 'longitude'
                            v_min = numpy.nanmin(ds.variables[var][:]).item()
                            v_max = numpy.nanmax(ds.variables[var][:]).item()
                            renderer = StretchedRenderer([(v_min, Color(0, 0, 0)), (v_max, Color(255, 255, 255))])
                            variable = Variable.objects.create(
                                service=service,
                                index=0,
                                variable=var,
                                projection=WGS84,
                                x_dimension=lon,
                                y_dimension=lat,
                                name=var,
                                renderer=renderer,
                                full_extent=extent
                            )
                    else:
                        print('{} already exists, skipping.'.format(service_name))
