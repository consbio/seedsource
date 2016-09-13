import {
    SET_POPUP_LOCATION, RESET_POPUP_LOCATION, REQUEST_POPUP_VALUE, RECEIVE_POPUP_VALUE, RECEIVE_POPUP_ELEVATION
} from '../actions/popup'
import { REMOVE_VARIABLE, ADD_VARIABLE } from '../actions/variables'
import { morph } from '../utils'

const defaultState = {
    point: null,
    isFetchingElevation: false,
    elevation: null,
    values: []
}

export default (state = defaultState, action) => {
    let updateValue = (name, props) => {
        let { values } = state
        let index = values.findIndex(item => item.name === name)

        if (index === -1) {
            return state
        }
        else {
            let value = morph(values[index], props)
            return morph(state, {values: values.slice(0, index).concat([value, ...values.slice(index + 1)])})
        }
    }

    switch (action.type) {
        case SET_POPUP_LOCATION:
            let { lat, lon } = action

            return morph(state, {point: {x: lon, y: lat }, elevation: null, values: state.values.map(item => {
                return morph(item, {value: null})
            })})

        case RESET_POPUP_LOCATION:
            return morph(defaultState, {values: state.values.map(item => {
                return morph(item, {value: null})
            })})

        case REQUEST_POPUP_VALUE:
            return updateValue(action.variable, {isFetching: true, value: null})

        case RECEIVE_POPUP_VALUE:
            return updateValue(action.variable, {isFetching: false, value: action.value})

        case REMOVE_VARIABLE:
            return morph(state, {
                values: state.values.slice(0, action.index).concat(state.values.slice(action.index+1))
            })

        case ADD_VARIABLE:
            return morph(state, {
                values: [...state.values, {name: action.variable, value: null}]
            })

        case RECEIVE_POPUP_ELEVATION:
            return morph(state, {elevation: action.elevation})

        default:
            return state
    }
}
