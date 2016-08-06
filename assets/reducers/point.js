import { SET_LATITUDE, SET_LONGITUDE, SET_POINT } from '../actions/point'

export default (state = null, action) => {
    switch(action.type) {
        case SET_LATITUDE:
            return {x: state ? state.x : '', y: action.value}

        case SET_LONGITUDE:
            return {x: action.value, y: state ? state.y : ''}

        case SET_POINT:
            return {x: action.lon, y: action.lat}

        default:
            return state
    }
}
