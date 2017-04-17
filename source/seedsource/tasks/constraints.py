import datetime
import math
import os

import numpy
from clover.netcdf.variable import SpatialCoordinateVariables
from django.conf import settings
from ncdjango.models import Service
from netCDF4._netCDF4 import Dataset


class Constraint(object):
    def __init__(self, data, region):
        self.data = data
        self.region = region
        self.mask = None

    @staticmethod
    def by_name(constraint):
        return {
            'elevation': ElevationConstraint,
            'photoperiod': PhotoperiodConstraint,
            'latitude': LatitudeConstraint
        }[constraint]

    def apply_constraint(self, **kwargs):
        if self.mask is None:
            self.mask = self.get_mask(**kwargs)

        return numpy.ma.masked_where(self.mask, self.data)

    def get_mask(self, **kwargs):
        raise NotImplemented


class ElevationConstraint(Constraint):
    def get_mask(self, **kwargs):
        try:
            min_elevation = kwargs['min']
            max_elevation = kwargs['max']
        except KeyError:
            raise ValueError('Missing constraint arguments')

        service = Service.objects.get(name='{}_dem'.format(self.region))
        with Dataset(os.path.join(settings.NC_SERVICE_DATA_ROOT, service.data_path)) as ds:
            elevation = ds.variables['elevation'][:]

        mask = elevation < min_elevation
        mask |= elevation > max_elevation

        return mask


class PhotoperiodConstraint(Constraint):
    def get_julian_day(self, date):
        a = (14 - date.month) // 12
        y = date.year + 4800 - a
        m = date.month + 12 * a - 3
        julian_date = date.day + (153 * m + 2) // 5 + 365 * y + y // 4 - y // 100 + y // 400 - 32045

        return julian_date - 2451545 + .0008

    def daylight(self, date, lat, lon):
        """ Returns daylight hours for a single lat/lon point """

        julian_day = self.get_julian_day(date)
        solar_noon = julian_day - lon//360
        solar_anomaly = (357.5291 + 0.98560028*solar_noon) % 360
        equation_of_center = (
            1.9148*math.sin(math.radians(solar_anomaly)) +
            0.0200*math.sin(math.radians(2*solar_anomaly)) +
            0.0003*math.sin(math.radians(3*solar_anomaly))
        )
        ecliptic_longitude = (solar_anomaly + equation_of_center + 180 + 102.9372) % 360
        solar_transit = (
            2451545.5 + solar_noon + 0.0053*math.sin(math.radians(solar_anomaly)) -
            0.0069*math.sin(math.radians(2*ecliptic_longitude))
        )
        declination = math.asin(math.sin(math.radians(ecliptic_longitude))*math.sin(math.radians(23.44)))
        hour_angle = math.acos(
            (math.sin(math.radians(-.83)) - math.sin(math.radians(lat))*math.sin(declination)) /
            (math.cos(math.radians(lat))*math.cos(declination))
        )

        sunrise = solar_transit - math.degrees(hour_angle)/360
        sunset = solar_transit + math.degrees(hour_angle)/360

        return (sunset - sunrise) * 24

    def daylight_array(self, date, lat, lon):
        """ Returns daylight hours for arrays of lat/lon points """

        julian_day = self.get_julian_day(date)

        lat_arr = numpy.tile(lat.reshape(len(lat), 1), (1, len(lon)))
        lon_arr = numpy.tile(lon, (len(lat), 1))

        # solar_noon = julian_day - lon//360
        solar_noon = lon_arr
        del lon_arr
        solar_noon //= 360
        solar_noon -= julian_day
        solar_noon *= -1

        # solar_anomaly = (357.5291 + 0.98560028 * solar_noon) % 360
        solar_anomaly = solar_noon * 0.98560028
        solar_anomaly += 357.5291
        solar_anomaly %= 360

        # equation_of_center = (
        #     1.9148 * math.sin(math.radians(solar_anomaly)) +
        #     0.0200 * math.sin(math.radians(2 * solar_anomaly)) +
        #     0.0003 * math.sin(math.radians(3 * solar_anomaly))
        # )
        equation_of_center = numpy.radians(solar_anomaly)
        numpy.sin(equation_of_center, equation_of_center)
        equation_of_center *= 1.9148
        equation_of_center_2 = solar_anomaly * 2
        numpy.radians(equation_of_center_2, equation_of_center_2)
        numpy.sin(equation_of_center_2, equation_of_center_2)
        equation_of_center_2 *= 0.0200
        equation_of_center += equation_of_center_2
        equation_of_center_2 = solar_anomaly * 3
        numpy.radians(equation_of_center_2, equation_of_center_2)
        numpy.sin(equation_of_center_2, equation_of_center_2)
        equation_of_center_2 *= 0.0003
        equation_of_center += equation_of_center_2
        del equation_of_center_2

        # ecliptic_longitude = (solar_anomaly + equation_of_center + 180 + 102.9372) % 360
        ecliptic_longitude = equation_of_center
        del equation_of_center
        ecliptic_longitude += solar_anomaly
        ecliptic_longitude += 282.9372  # 180 + 102.9372
        ecliptic_longitude %= 360

        # solar_transit = (
        #     2451545.5 + solar_noon + 0.0053*math.sin(math.radians(solar_anomaly)) -
        #     0.0069*math.sin(math.radians(2*ecliptic_longitude))
        # )
        solar_transit = solar_noon
        del solar_noon
        solar_transit += 2451545.5
        numpy.radians(solar_anomaly, solar_anomaly)
        numpy.sin(solar_anomaly, solar_anomaly)
        solar_anomaly *= 0.0053
        solar_transit += solar_anomaly
        del solar_anomaly
        solar_transit_2 = ecliptic_longitude * 2
        numpy.radians(solar_transit_2, solar_transit_2)
        numpy.sin(solar_transit_2, solar_transit_2)
        solar_transit_2 *= 0.0069
        solar_transit -= solar_transit_2
        del solar_transit_2

        # declination = math.asin(math.sin(math.radians(ecliptic_longitude))*math.sin(math.radians(23.44)))
        declination = ecliptic_longitude
        del ecliptic_longitude
        numpy.radians(declination, declination)
        numpy.sin(declination, declination)
        declination *= math.sin(math.radians(23.44))
        numpy.arcsin(declination, declination)

        # hour_angle = math.acos(
        #     (math.sin(math.radians(-.83)) - math.sin(math.radians(lat)) * math.sin(declination)) /
        #     math.cos(math.radians(lat)) * math.cos(declination)
        # )
        hour_angle = numpy.radians(lat_arr)
        numpy.sin(hour_angle, hour_angle)
        hour_angle *= numpy.sin(declination)
        hour_angle -= math.sin(math.radians(-.83))
        hour_angle *= -1
        numpy.radians(lat_arr, lat_arr)
        numpy.cos(lat_arr, lat_arr)
        numpy.cos(declination, declination)
        lat_arr *= declination
        del declination
        hour_angle /= lat_arr
        del lat_arr
        numpy.arccos(hour_angle, hour_angle)

        # sunrise = solar_transit - math.degrees(hour_angle) / 360
        # sunset = solar_transit + math.degrees(hour_angle) / 360
        # return (sunset - sunrise) * 24
        numpy.degrees(hour_angle, hour_angle)
        hour_angle /= 360
        solar_transit = solar_transit.astype('float64')
        days = (solar_transit + hour_angle) - (solar_transit - hour_angle)
        days *= 24
        return days

    def get_mask(self, minutes, lat, lon, year, month, day):
        date = datetime.date(year, month, day)
        hours = minutes / 60

        daylight = self.daylight(date, lat, lon)

        service = Service.objects.get(name='{}_dem'.format(self.region))
        with Dataset(os.path.join(settings.NC_SERVICE_DATA_ROOT, service.data_path)) as ds:
            lat_arr = ds['lat'][:]
            lon_arr = ds['lon'][:]

        daylight_arr = self.daylight_array(date, lat_arr, lon_arr)

        mask = daylight_arr < (daylight - hours)
        mask |= daylight_arr > (daylight + hours)

        return mask


class LatitudeConstraint(Constraint):
    def get_mask(self, **kwargs):
        try:
            min_lat = kwargs['min']
            max_lat = kwargs['max']
        except KeyError:
            raise ValueError('Missing constraint arguments')

        min_lat, max_lat = sorted((min_lat, max_lat))

        coords = SpatialCoordinateVariables.from_bbox(self.data.extent, *reversed(self.data.shape))
        start, stop = coords.y.indices_for_range(min_lat, max_lat)

        mask = numpy.zeros_like(self.data, 'bool')
        mask[:start][:] = True
        mask[stop+1:][:] = True

        return mask

