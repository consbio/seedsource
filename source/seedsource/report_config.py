from collections import namedtuple

Variable = namedtuple(
    'Variable',
    ['label', 'multiplier', 'format_value', 'format_transfer', 'metric_label', 'imperial_label']
)

Constraint = namedtuple(
    'Constraint',
    ['label', 'format_value', 'format_range']
)


def convert_to_f(value):
    return value * 1.8 + 32


def convert_relative_to_f(value):
    return value * 1.8


def convert_to_in(value):
    return value / 25.4


def convert_to_feet(value):
    return value / 0.3048


def convert_to_miles(value):
    return value / 1.60934


def format_temperature_value(value, is_imperial):
    return '{:.1f}'.format(round(convert_to_f(value) if is_imperial else value, 1))


def format_relative_temperature_value(value, is_imperial):
    return '{:.1f}'.format(round(convert_relative_to_f(value) if is_imperial else value, 1))


def format_temperature_transfer(value, is_imperial):
    return '{:.2f}'.format(round(convert_relative_to_f(value) if is_imperial else value, 2))


def format_precip_value(value, is_imperial):
    return '{:.1f}'.format(round(convert_to_in(value), 1) if is_imperial else round(value))


def format_whole_value(value, is_imperial):
    return round(value)


VARIABLE_CONFIG = {
    'MAT': Variable(
        'Mean annual temperature', 10, format_temperature_value, format_temperature_transfer, '&deg;C', '&deg;F'
    ),
    'MWMT': Variable(
        'Mean warmest month temperature', 10, format_temperature_value, format_temperature_transfer, '&deg;C', '°F'
    ),
    'MCMT': Variable(
        'Mean coldest month temperature', 10, format_temperature_value, format_temperature_transfer, '&deg;C', '°F'
    ),
    'TD': Variable(
        'Temperature difference between MWMT and MCMT, or continentality', 10, format_relative_temperature_value,
        format_temperature_transfer, '°C', '°F'
    ),
    'MAP': Variable('Mean annual precipitation', 1, format_precip_value, format_precip_value, 'mm', 'in'),
    'MSP': Variable(
        'Mean summer precipitation, May to September', 1, format_precip_value, format_precip_value, 'mm', 'in'
    ),
    'AHM': Variable('Annual heat-moisture index', 10, format_whole_value, format_whole_value, '', ''),
    'SHM': Variable('Summer heat-moisture index', 10, format_whole_value, format_whole_value, '', ''),
    'DD_0': Variable('Degree-days below 0°C', 1, format_whole_value, format_whole_value, 'dd', 'dd'),
    'DD5': Variable('Degree-days above 5°C', 1, format_whole_value, format_whole_value, 'dd', 'dd'),
    'FFP': Variable('Frost-free period', 1, format_whole_value, format_whole_value, 'days', 'days'),
    'PAS': Variable('Precipitation as snow, August to July', 1, format_precip_value, format_precip_value, 'mm', 'in'),
    'EMT': Variable(
        'Extreme minimum temperature over 30 years', 10, format_temperature_value, format_temperature_transfer,
        '&deg;C', '&deg;F'
    ),
    'EXT': Variable(
        'Extreme maximum temperature over 30 years', 10, format_temperature_value, format_temperature_transfer,
        '&deg;C', '&deg;F'
    ),
    'Eref': Variable('Hargreaves reference evaporation', 1, format_precip_value, format_precip_value, 'mm', 'in'),
    'CMD': Variable('Hargreaves climatic moisture deficit', 1, format_precip_value, format_precip_value, 'mm', 'in')
}


def format_elevation_value(config, is_imperial):
    elevation = config['point']['elevation']
    return '{:.1f} ft'.format(convert_to_feet(elevation)) if is_imperial else '{:.1f} m'.format(elevation)


def format_elevation_range(values, is_imperial):
    return '{:.1f} ft'.format(convert_to_feet(values['range'])) if is_imperial else '{:.1f} m'.format(values['range'])


def format_photoperiod_value(config, is_imperial):
    return '{y:.2f}, {x:.2f}'.format(**config['point'])


def format_photoperiod_range(values, is_imperial):
    return '{hours:.1f} hours, {day} {month}'.format(**values)


def format_latitude_value(config, is_imperial):
    return '{y:.2f} &deg;N'.format(**config['point'])


def format_latitude_range(values, is_imperial):
    return '{range:.2f} &deg;N'.format(**values)


def format_longitude_value(config, is_imperial):
    return '{x:.2f} &deg;E'.format(**config['point'])


def format_longitude_range(values, is_imperial):
    return '{range:.2f} &deg;E'.format(**values)


def format_distance_range(values, is_imperial):
    return '{} mi'.format(convert_to_miles(values['range'])) if is_imperial else '{} km'.format(values['range'])


CONSTRAINT_CONFIG = {
    'elevation': Constraint('Elevation', format_elevation_value, format_elevation_range),
    'photoperiod': Constraint('Photoperiod', format_photoperiod_value, format_photoperiod_range),
    'latitude': Constraint('Latitutde', format_latitude_value, format_latitude_range),
    'longitude': Constraint('Longitude', format_longitude_value, format_longitude_range),
    'distance': Constraint('Distance', format_photoperiod_value, format_distance_range)
}
