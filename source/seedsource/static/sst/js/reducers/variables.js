import { variables } from '../config'

export default (state = [], action) => {
    let variable

    switch(action.type) {
        case 'ADD_VARIABLE':
            variable = variables.find((item) => item.name === action.variable)

            return [...state, {
                name: variable.name,
                label: variable.label,
                value: null,
                transfer: null
            }]

        case 'REMOVE_VARIABLE':
            return state.slice(0, action.index).concat(state.slice(action.index+1))

        case 'MODIFY_VARIABLE':
            variable = Object.assign({}, state[action.index], {transfer: action.transfer})
            return state.slice(0, action.index).concat([variable, ...state.slice(action.index+1)])
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
