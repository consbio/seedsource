const defaultState = {
    seedlot: {
        time: '1961_1990',
        model: null
    },

    site: {
        time: '1961_1990',
        model: 'rcp45'
    }
}

export default (state=defaultState, action) => {
    let climate = state[action.climate]
    let newState = Object.assign({}, state)

    switch (action.type) {
        case 'SELECT_CLIMATE_YEAR':
            newState[action.climate] = Object.assign({}, climate,  {time: action.year})
            return newState

        case 'SELECT_CLIMATE_MODEL':
            newState[action.climate] = Object.assign({}, climate, {model: action.model})
            return newState

        default:
            return state
    }
}
