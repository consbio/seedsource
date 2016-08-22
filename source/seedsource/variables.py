from collections import namedtuple

Variable = namedtuple(
    'Variable',
    ['label', 'multiplier', 'format_value', 'format_transfer', 'metric_label', 'imperial_label']
)


def convert_to_f(value):
    return value * 1.8 + 32


def convert_relative_to_f(value):
    return value * 1.8


def convert_to_in(value):
    return value / 25.4


def format_temperature_value(value, is_imperial):
    return round(convert_to_f(value) if is_imperial else value, 1)


def format_relative_temperature_value(value, is_imperial):
    return round(convert_relative_to_f(value) if is_imperial else value, 1)


def format_temperature_transfer(value, is_imperial):
    return round(convert_relative_to_f(value) if is_imperial else value, 2)


def format_precip_value(value, is_imperial):
    return round(convert_to_in(value), 1) if is_imperial else round(value)


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
