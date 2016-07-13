import point from './point'
import variables from './variables'

const defaultConfiguration = {
    objective: 'seedlots',
    species: 'generic',
    point: null,
    region: 'west1',
    time: '1961_1990',
    model: 'rcp45',
    method: 'seedzone',
    unit: 'metric',
    variables: []
}

export default (state = defaultConfiguration, action) => {
    switch(action.type) {
        case 'SELECT_OBJECTIVE':
            return Object.assign({}, state, {
                objective: action.objective,
                variables: variables(state.variables, action)
            })

        case 'SET_LATITUDE':
        case 'SET_LONGITUDE':
        case 'SET_POINT':
            return Object.assign({}, state, {
                point: point(state.point, action),
                variables: variables(state.variables, action)
            })

        case 'SELECT_CLIMATE_YEAR':
            return Object.assign({}, state, {
                time: action.year,
                variables: variables(state.variables, action)
            })

        case 'SELECT_CLIMATE_MODEL':
            return Object.assign({}, state, {
                model: action.model,
                variables: variables(state.variables, action)
            })

        case 'SELECT_SPECIES':
            return Object.assign({}, state, {species: action.species, variable: variables(state.variables, action)})

        case 'SELECT_UNIT':
            return Object.assign({}, state, {unit: action.unit})

        case 'SELECT_METHOD':
            return Object.assign({}, state, {method: action.method})

        case 'ADD_VARIABLE':
        case 'REMOVE_VARIABLE':
        case 'MODIFY_VARIABLE':
        case 'REQUEST_VALUE':
        case 'RECEIVE_VALUE':
        case 'REQUEST_LEGEND':
        case 'RECEIVE_LEGEND':
        case 'SELECT_ZONE':
        case 'SELECT_METHOD':
        case 'REQUEST_TRANSFER':
        case 'RECEIVE_TRANSFER':
            return Object.assign({}, state, {variables: variables(state.variables, action)})

        case 'LOAD_CONFIGURATION':
            return Object.assign({}, defaultConfiguration, action.configuration)
        
        default:
            return state
    }
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
