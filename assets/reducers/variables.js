import { variables } from '../config'

export default (state = [], action) => {
    let variable, index

    let updateVariable = (name, values) => {
        index = state.findIndex(item => item.name === name)

        if (index === -1) {
            return state
        }
        else {
            variable = Object.assign({}, state[index], values)
            return state.slice(0, index).concat([variable, ...state.slice(index + 1)])
        }
    }

    switch(action.type) {
        case 'ADD_VARIABLE':
            variable = variables.find((item) => item.name === action.variable)

            let {name, label, multiplier, units} = variable

            return [...state, {
                name,
                label,
                multiplier,
                units,
                value: null,
                transfer: null,
                isFetching: false,
                isFetchingTransfer: false
            }]

        case 'REMOVE_VARIABLE':
            return state.slice(0, action.index).concat(state.slice(action.index+1))

        case 'MODIFY_VARIABLE':
            variable = Object.assign({}, state[action.index], {transfer: action.transfer})
            return state.slice(0, action.index).concat([variable, ...state.slice(action.index+1)])

        case 'REQUEST_VALUE':
            return updateVariable(action.variable, {isFetching: true})

        case 'RECEIVE_VALUE':
            return updateVariable(action.variable, {isFetching: false, value: action.value})

        case 'SET_LATITUDE':
        case 'SET_LONGITUDE':
        case 'SET_POINT':
            return state.map(item => Object.assign({}, item, {
                isFetching: false,
                isFetchingTransfer: false,
                value: null,
                transfer: null
            }))

        case 'SELECT_OBJECTIVE':
        case 'SELECT_CLIMATE_YEAR':
        case 'SELECT_CLIMATE_MODEL':
            return state.map(item => Object.assign({}, item, {isFetching: false, value: null}))
        
        case 'SELECT_ZONE':
        case 'SELECT_METHOD':
        case 'SELECT_SPECIES':
            return state.map(item => Object.assign({}, item, {isFetchingTransfer: false, transfer: null}))

        case 'REQUEST_TRANSFER':
            return updateVariable(action.variable, {isFetchingTransfer: true})

        case 'RECEIVE_TRANSFER':
            return updateVariable(action.variable, {isFetchingTransfer: false, transfer: action.transfer})


        default:
            return state
    }
}

export const activeVariable = (state = null, action) => {
    switch(action.type) {
        case 'TOGGLE_VARIABLE':
            return state === action.variable ? null : action.variable

        case 'REMOVE_VARIABLE':
            return action.variable === state ? null : state

        case 'FINISH_JOB':
            return null

        default:
            return state
    }
}
