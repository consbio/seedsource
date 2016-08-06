import { variables } from '../config'
import {
    ADD_VARIABLE, REMOVE_VARIABLE, MODIFY_VARIABLE, RESET_TRANSFER, REQUEST_VALUE, RECEIVE_VALUE, SELECT_METHOD,
    REQUEST_TRANSFER, RECEIVE_TRANSFER, TOGGLE_VARIABLE
} from '../actions/variables'
import { SET_LATITUDE, SET_LONGITUDE, SET_POINT } from '../actions/point'
import { SELECT_OBJECTIVE } from '../actions/objectives'
import { SELECT_CLIMATE_YEAR, SELECT_CLIMATE_MODEL } from '../actions/climate'
import { SELECT_ZONE } from '../actions/zones'
import { FINISH_JOB } from '../actions/job'


export default (state = [], action) => {
    let variable, index

    let getVariable = name => state.find(item => item.name === name)

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
        case ADD_VARIABLE:
            variable = variables.find((item) => item.name === action.variable)

            let { name } = variable

            return [...state, {
                name,
                value: null,
                transfer: null,
                defaultTransfer: null,
                avgTransfer: null,
                zoneCenter: null,
                transferIsModified: false,
                isFetching: false,
                isFetchingTransfer: false
            }]

        case REMOVE_VARIABLE:
            return state.slice(0, action.index).concat(state.slice(action.index+1))

        case MODIFY_VARIABLE:
            return updateVariable(action.variable, {transfer: action.transfer, transferIsModified: true})

        case RESET_TRANSFER:
            variable = getVariable(action.variable)

            return updateVariable(action.variable, {transfer: variable.defaultTransfer, transferIsModified: false})

        case REQUEST_VALUE:
            return updateVariable(action.variable, {isFetching: true})

        case RECEIVE_VALUE:
            return updateVariable(action.variable, {isFetching: false, value: action.value})

        case SET_LATITUDE:
        case SET_LONGITUDE:
        case SET_POINT:
            return state.map(item => Object.assign({}, item, {
                isFetching: false,
                isFetchingTransfer: false,
                value: null,
                defaultTransfer: null,
                avgTransfer: null,
                zoneCenter: null,
                transfer: item.transferIsModified ? item.transfer : null
            }))

        case SELECT_OBJECTIVE:
        case SELECT_CLIMATE_YEAR:
        case SELECT_CLIMATE_MODEL:
            return state.map(item => Object.assign({}, item, {isFetching: false, value: null}))
        
        case SELECT_ZONE:
        case SELECT_METHOD:
            return state.map(item => Object.assign({}, item, {
                isFetchingTransfer: false,
                defaultTransfer: null,
                avgTransfer: null,
                zoneCenter: null,
                transfer: item.transferIsModified ? item.transfer : null
            }))

        case REQUEST_TRANSFER:
            return updateVariable(action.variable, {isFetchingTransfer: true})

        case RECEIVE_TRANSFER:
            variable = getVariable(action.variable)
            if (variable === undefined) {
                return state
            }

            return updateVariable(action.variable, {
                isFetchingTransfer: false,
                defaultTransfer: action.transfer,
                avgTransfer: action.avgTransfer,
                zoneCenter: action.center,
                transfer: variable.transferIsModified ? variable.transfer : action.transfer
            })


        default:
            return state
    }
}

export const activeVariable = (state = null, action) => {
    switch(action.type) {
        case TOGGLE_VARIABLE:
            return state === action.variable ? null : action.variable

        case REMOVE_VARIABLE:
            return action.variable === state ? null : state

        case FINISH_JOB:
            return null

        default:
            return state
    }
}
