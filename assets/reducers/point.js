import { SET_LATITUDE, SET_LONGITUDE, SET_POINT, SET_ELEVATION } from '../actions/point'
import { morph } from '../utils'

export const defaultState = {
    x: '',
    y: '',
    elevation: null
}

export default (state = defaultState, action) => {
    switch(action.type) {
        case SET_LATITUDE:
            return morph(state, {y: action.value, elevation: null})

        case SET_LONGITUDE:
            return morph(state, {x: action.value, elevation: null})

        case SET_POINT:
            return morph(state, {x: action.lon, y: action.lat, elevation: null})

        case SET_ELEVATION:
            return morph(state, {elevation: action.elevation})

        default:
            return state
    }
}
