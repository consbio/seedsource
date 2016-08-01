from collections import namedtuple

Variable = namedtuple(
    'Variable',
    ['label', 'multiplier', 'value_to_imperial', 'transfer_to_imperial', 'metric_label', 'imperial_label']
)


def convert_to_f(value): return value * 1.8 + 32


def convert_relative_to_f(value): return value * 1.8


def convert_to_in(value): return value / 25.4


def no_conversion(value): return value


VARIABLE_CONFIG = {
    'MAT': Variable('Mean annual temperature', 10, convert_to_f, convert_relative_to_f, '°C', '°F'),
    'MWMT': Variable('Mean warmest month temperature', 10, convert_to_f, convert_relative_to_f, '°C', '°F'),
    'MCMT': Variable('Mean coldest month temperature', 10, convert_to_f, convert_relative_to_f, '°C', '°F'),
    'TD': Variable(
        'Temperature difference between MWMT and MCMT, or continentality', 10, convert_relative_to_f,
        convert_relative_to_f, '°C', '°F'
    ),
    'MAP': Variable('Mean annual precipitation', 1, convert_to_in, convert_to_in, 'mm', 'in'),
    'MSP': Variable('Mean summer precipitation, May to September', 1, convert_to_in, convert_to_in, 'mm', 'in'),
    'AHM': Variable('Annual heat-moisture index', 10, no_conversion, no_conversion, '', ''),
    'SHM': Variable('Summer heat-moisture index', 10, no_conversion, no_conversion, '', ''),
    'DD_0': Variable('Degree-days below 0°C', 1, no_conversion, no_conversion, 'dd', 'dd'),
    'DD5': Variable('Degree-days above 5°C', 1, no_conversion, no_conversion, 'dd', 'dd'),
    'FFP': Variable('Frost-free period', 1, no_conversion, no_conversion, 'days', 'days'),
    'PAS': Variable('Precipitation as snow, August to July', 1, convert_to_in, convert_to_in, 'mm', 'in'),
    'EMT': Variable('Extreme minimum temperature over 30 years', 10, convert_to_f, convert_relative_to_f, '°C', '°F'),
    'EXT': Variable('Extreme maximum temperature over 30 years', 10, convert_to_f, convert_relative_to_f, '°C', '°F'),
    'Eref': Variable('Hargreaves reference evaporation', 1, convert_to_in, convert_to_in, 'mm', 'in'),
    'CMD': Variable('Hargreaves climatic moisture deficit', 1, convert_to_in, convert_to_in, 'mm', 'in')
}
