import point from './point'
import variables from './variables'

const defaultConfiguration = {
    objective: 'seedlots',
    species: 'df',
    point: null,
    region: 'west1',
    time: '1961_1990',
    model: 'rcp45',
    variables: []
}

export default (state = defaultConfiguration, action) => {
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
        case 'ADD_VARIABLE':
        case 'REMOVE_VARIABLE':
        case 'MODIFY_VARIABLE':
            return Object.assign({}, state, {variables: variables(state.variables, action)})
        default:
            return state
    }
}
