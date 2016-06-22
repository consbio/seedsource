export const variables = [
    {
        name: 'MAT',
        label: 'Mean annual temperature',
        multiplier: 10
    },
    {
        name: 'MWMT',
        label: 'Mean warmest month temperature',
        multiplier: 10
    },
    {
        name: 'MCMT',
        label: 'Mean coldest month temperature',
        multiplier: 10
    },
    {
        name: 'TD',
        label: 'Temperature difference between MWMT and MCMT, or continentality',
        multiplier: 10
    },
    {
        name: 'MAP',
        label: 'Mean annual precipitation (mm)',
        multiplier: 1
    },
    {
        name: 'MSP',
        label: 'May to September precipitation (mm)',
        multiplier: 1
    },
    {
        name: 'AHM',
        label: 'Annual heat­moisture index',
        multiplier: 10
    },
    {
        name: 'SHM',
        label: 'Summer heat­moisture index',
        multiplier: 10
    },
    {
        name: 'DD_0',
        label: 'Degree­days below 0°C, chilling degree­days',
        multiplier: 1
    },
    {
        name: 'FFP',
        label: 'Frost­free period',
        multiplier: 1
    },
    {
        name: 'PAS',
        label: 'Precipitation as snow (mm) between August in previous year and July in current year',
        multiplier: 1
    },
    {
        name: 'EMT',
        label: 'Extreme minimum temperature over 30 years',
        multiplier: 10
    },
    {
        name: 'EXT',
        label: 'Extreme maximum temperature over 30 years',
        multiplier: 10
    },
    {
        name: 'Eref',
        label: 'Hargreaves reference evaporation (mm)',
        multiplier: 1
    },
    {
        name: 'CMD',
        label: 'Hargreaves climatic moisture deficit (mm)',
        multiplier: 1
    }
];

export const species = [
    {
        name: 'df',
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
        name: 'lp',
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
        name: 'pp',
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
        name: 'wrc',
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
        name: 'wwp',
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
