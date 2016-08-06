import { SELECT_OBJECTIVE } from '../actions/objectives'
import { SELECT_CLIMATE_YEAR, SELECT_CLIMATE_MODEL } from '../actions/climate'
import { TOGGLE_VARIABLE } from '../actions/variables'
import {
    REQUEST_VARIABLE_LEGEND, RECEIVE_VARIABLE_LEGEND, REQUEST_RESULTS_LEGEND, RECEIVE_RESULTS_LEGEND
} from '../actions/legends'
import { morph } from '../utils'

const defaultState = {
    variable: {
        legend: null,
        isFetching: false
    },
    results: {
        legend: null,
        isFetching: false
    }
}

 export default (state = defaultState, action) => {
    switch(action.type) {
        case SELECT_OBJECTIVE:
        case SELECT_CLIMATE_YEAR:
        case SELECT_CLIMATE_MODEL:
        case TOGGLE_VARIABLE:
            return morph(state, {variable: defaultState.variable})

        case REQUEST_VARIABLE_LEGEND:
            return morph(state, {variable: morph(state.variable, {isFetching: true})})

        case RECEIVE_VARIABLE_LEGEND:
            return morph(state, {variable: {legend: action.legend, isFetching: false}})

        case REQUEST_RESULTS_LEGEND:
            return morph(state, {results: morph(state.results, {isFetching: true})})

        case RECEIVE_RESULTS_LEGEND:
            return morph(state, {results: {legend: action.legend, isFetching: false}})

        default:
            return state
    }
}
