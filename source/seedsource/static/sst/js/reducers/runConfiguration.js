import point from './point'

const defaultConfiguration = {
    objective: 'seedlots',
    species: 'df',
    point: null,
    region: 'west1',
    time: '1961_1990',
    model: 'rcp45'
}

export default (state = defaultConfiguration, action) => {
    switch(action.type) {
        case 'SELECT_OBJECTIVE':
            return Object.assign({}, state, {objective: action.objective})
        case 'SET_LATITUDE':
        case 'SET_LONGITUDE':
            return Object.assign({}, state, {point: point(state.point, action)})
        default:
            return state
    }
}
