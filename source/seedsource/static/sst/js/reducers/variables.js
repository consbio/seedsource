import { variables } from '../config'

export default (state = [], action) => {
    let variable, index

    switch(action.type) {
        case 'ADD_VARIABLE':
            variable = variables.find((item) => item.name === action.variable)

            let {name, label, multiplier, isTemperature} = variable

            return [...state, {
                name,
                label,
                multiplier,
                isTemperature,
                value: null,
                transfer: null,
                isFetching: false
            }]

        case 'REMOVE_VARIABLE':
            return state.slice(0, action.index).concat(state.slice(action.index+1))

        case 'MODIFY_VARIABLE':
            variable = Object.assign({}, state[action.index], {transfer: action.transfer})
            return state.slice(0, action.index).concat([variable, ...state.slice(action.index+1)])

        case 'REQUEST_VALUE':
            index = state.findIndex(item => item.name === action.variable)
            variable = Object.assign({}, state[index], {isFetching: true})
            return state.slice(0, index).concat([variable, ...state.slice(index+1)])

        case 'RECEIVE_VALUE':
            index = state.findIndex(item => item.name === action.variable)

            if (index === -1) {
                return state
            }
            else {
                variable = Object.assign({}, state[index], {isFetching: false, value: action.value})
                return state.slice(0, index).concat([variable, ...state.slice(index+1)])
            }

        case 'SET_LATITUDE':
        case 'SET_LONGITUDE':
        case 'SET_POINT':
        case 'SELECT_OBJECTIVE':
        case 'SELECT_CLIMATE_YEAR':
        case 'SELECT_CLIMATE_MODEL':
            return state.map(item => Object.assign({}, item, {isFetching: false, value: null}))

        default:
            return state
    }
}

export const activeVariable = (state = null, action) => {
    switch(action.type) {
        case 'TOGGLE_VARIABLE':
            return state === action.variable ? null : action.variable

        default:
            return state
    }
}
