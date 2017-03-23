import {topojson} from 'leaflet-omnivore';

export const collapsibleSteps = false

const celsiusUnits = {
    metric: {
        label: '°C',
        convert: value => (value - 32) / 1.8,  // Convert to celsius
        convertTransfer: value => value / 1.8,  // Convert difference to celsuis
        precision: 1,
        transferPrecision: 2
    },
    imperial: {
        label: '°F',
        convert: value => value * 1.8 + 32,  // Convert to fahrenheit
        convertTransfer: value => value * 1.8, // Convert difference to fahrenheit
        precision: 1,
        transferPrecision: 2
    }
}

const mmUnits = {
    metric: {
        label: 'mm',
        convert: value => value * 25.4, // Convert to millimeters
        precision: 0,
        transferPrecision: 0
    },
    imperial: {
        label: 'in',
        convert: value => value / 25.4, // Convert to inches
        precision: 1,
        transferPrecision: 1
    }
}

const daysUnits = {
    metric: {
        label: 'days',
        convert: value => value,
        precision: 0,
        transferPrecision: 0
    },
    imperial: {
        label: 'days',
        convert: value => value,
        precision: 0,
        transferPrecision: 0
    }
}

const degreeDaysUnits = {
    metric: {
        label: 'dd',
        convert: value => value,
        precision: 0,
        transferPrecision: 0
    },
    imperial: {
        label: 'dd',
        convert: value => value,
        precision: 0,
        transferPrecision: 0
    }
}

const heatMoistureUnits = {
    metric: {
        label: '',
        convert: value => value,
        precision: 1,
        transferPrecision: 1
    },
    imperial: {
        label: '',
        convert: value => value,
        precision: 1,
        transferPrecision: 1
    }
}

export const variables = [
    {
        name: 'MAT',
        label: 'Mean annual temperature',
        multiplier: 10,
        units: celsiusUnits,
    },
    {
        name: 'MWMT',
        label: 'Mean warmest month temperature',
        multiplier: 10,
        units: celsiusUnits,
    },
    {
        name: 'MCMT',
        label: 'Mean coldest month temperature',
        multiplier: 10,
        units: celsiusUnits,
    },
    {
        name: 'TD',
        label: 'Temperature difference between MWMT and MCMT, or continentality',
        multiplier: 10,
        units: {
            metric: {
                label: '°C',
                convert: value => value / 1.8,  // Convert temp difference to C
                precision: 1,
                transferPrecision: 2
            },
            imperial: {
                label: '°F',
                convert: value => value * 1.8, // Convert temp difference to F
                precision: 1,
                transferPrecision: 2
            }
        }
    },
    {
        name: 'MAP',
        label: 'Mean annual precipitation',
        multiplier: 1,
        units: mmUnits
    },
    {
        name: 'MSP',
        label: 'Mean summer precipitation, May to September',
        multiplier: 1,
        units: mmUnits
    },
    {
        name: 'AHM',
        label: 'Annual heat-moisture index',
        multiplier: 10,
        units: heatMoistureUnits
    },
    {
        name: 'SHM',
        label: 'Summer heat-moisture index',
        multiplier: 10,
        units: heatMoistureUnits
    },
    {
        name: 'DD_0',
        label: 'Degree-days below 0°C',
        multiplier: 1,
        units: degreeDaysUnits
    },
    {
        name: 'DD5',
        label: 'Degree-days above 5°C',
        multiplier: 1,
        units: degreeDaysUnits
    },
    {
        name: 'FFP',
        label: 'Frost-free period',
        multiplier: 1,
        units: daysUnits
    },
    {
        name: 'PAS',
        label: 'Precipitation as snow, August to July',
        multiplier: 1,
        units: mmUnits
    },
    {
        name: 'EMT',
        label: 'Extreme minimum temperature over 30 years',
        multiplier: 10,
        units: celsiusUnits
    },
    {
        name: 'EXT',
        label: 'Extreme maximum temperature over 30 years',
        multiplier: 10,
        units: celsiusUnits
    },
    {
        name: 'Eref',
        label: 'Hargreaves reference evaporation',
        multiplier: 1,
        units: mmUnits
    },
    {
        name: 'CMD',
        label: 'Hargreaves climatic moisture deficit',
        multiplier: 1,
        units: mmUnits
    }
];

export const species = [
    {
        name: 'psme',
        label: 'Douglas-fir',
        transfers: {
            MAT: 20,
            MWMT: 20,
            MCMT: 20,
            TD: 20,
            EMT: 20,
            EXT: 20,
            MAP: 200,
            MSP: 50,
            FFP: 20,
            AHM: 30,
            SHM: 20
        }
    },
    {
        name: 'pico',
        label: 'Lodgepole pine',
        transfers: {
            MAT: 20,
            MWMT: 20,
            MCMT: 20,
            TD: 20,
            EMT: 20,
            EXT: 20,
            MAP: 200,
            MSP: 50,
            FFP: 20,
            AHM: 30,
            SHM: 20
        }
    },
    {
        name: 'pipo',
        label: 'Ponderosa pine',
        transfers: {
            MAT: 25,
            MWMT: 25,
            MCMT: 25,
            TD: 25,
            EMT: 25,
            EXT: 25,
            MAP: 200,
            MSP: 50,
            FFP: 30,
            AHM: 30,
            SHM: 20
        }
    },
    {
        name: 'thpl',
        label: 'Western red cedar',
        transfers: {
            MAT: 30,
            MWMT: 30,
            MCMT: 30,
            TD: 30,
            EMT: 30,
            EXT: 30,
            MAP: 200,
            MSP: 50,
            FFP: 50,
            AHM: 30,
            SHM: 20
        }
    },
    {
        name: 'pimo',
        label: 'Western white pine',
        transfers: {
            MAT: 30,
            MWMT: 30,
            MCMT: 30,
            TD: 30,
            EMT: 30,
            EXT: 30,
            MAP: 200,
            MSP: 50,
            FFP: 50,
            AHM: 30,
            SHM: 20
        }
    }
]

export const timeLabels = {
    '1961_1990': '1961 - 1990',
    '1981_2010': '1981 - 2010',
    '2025rcp45': '2025 RCP 4.5',
    '2025rcp85': '2025 RCP 8.5',
    '2055rcp45': '2055 RCP 4.5',
    '2055rcp85': '2055 RCP 8.5',
    '2085rcp45': '2085 RCP 4.5',
    '2085rcp85': '2085 RCP 8.5'
}

export const regions = [
    {
        name: 'ak2',
        label: 'Alaska'
    },
    {
        name: 'west2',
        label: 'Western US'
    },
    {
        name: 'nc1',
        label: 'North Central'
    },
    {
        name: 'ne1',
        label: 'North East'
    }
]

export const regionsBoundaries = topojson(
    '/static/sst/geometry/regions.topojson',
    null,
    L.geoJson(null, {
        style: {
            fill: 0,
            opacity: 0
        }
    })
)
