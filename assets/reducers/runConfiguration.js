import point from './point'
import variables from './variables'
import zones from './zones'

const defaultConfiguration = {
    objective: 'seedlots',
    species: 'generic',
    point: null,
    region: 'west1',
    time: '1961_1990',
    model: 'rcp45',
    method: 'seedzone',
    unit: 'metric',
    zones: null,
    variables: []
}

export default (state = defaultConfiguration, action) => {
    let runConfiguration = () => {
        switch(action.type) {
            case 'SELECT_OBJECTIVE':
                return Object.assign({}, state, {objective: action.objective})

            case 'SET_LATITUDE':
            case 'SET_LONGITUDE':
            case 'SET_POINT':
                return Object.assign({}, state, {point: point(state.point, action)})

            case 'SELECT_CLIMATE_YEAR':
                return Object.assign({}, state, {time: action.year})

            case 'SELECT_CLIMATE_MODEL':
                return Object.assign({}, state, {model: action.model})

            case 'SELECT_SPECIES':
                return Object.assign({}, state, {species: action.species})

            case 'SELECT_UNIT':
                return Object.assign({}, state, {unit: action.unit})

            case 'SELECT_METHOD':
                return Object.assign({}, state, {method: action.method})

            case 'LOAD_CONFIGURATION':
                return Object.assign({}, defaultConfiguration, action.configuration)

            default:
                return state
        }
    }

    state = runConfiguration()

    return Object.assign({}, state, {
        variables: variables(state.variables, action),
        zones: zones(state.zones || undefined, action)
    })
}

export const lastRun = (state = null, action) => {
    switch (action.type) {
        case 'FINISH_JOB':
            return action.configuration

        case 'LOAD_CONFIGURATION':
            return null

        default:
            return state
    }
}
