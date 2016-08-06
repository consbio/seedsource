import { SELECT_CLIMATE_YEAR, SELECT_CLIMATE_MODEL } from '../actions/climate'
import { morph } from '../utils'

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
    let newState = morph(state)

    switch (action.type) {
        case SELECT_CLIMATE_YEAR:
            newState[action.climate] = morph(climate,  {time: action.year})
            return newState

        case SELECT_CLIMATE_MODEL:
            newState[action.climate] = morph(climate, {model: action.model})
            return newState

        default:
            return state
    }
}
