import {
    REQUEST_REPORT, RECEIVE_REPORT, REQUEST_TIF_JOB, RECEIVE_TIF_JOB, FAIL_TIF_JOB, REQUEST_TIF_JOB_STATUS,
    RECEIVE_TIF_JOB_STATUS
} from '../actions/report'
import { morph } from '../utils'

const defaultState = {
    name: null,
    TIFJobId: null,
    TIFJobIsFetching: false,
}

export default (state = defaultState, action) => {
    switch (action.type) {
        case REQUEST_REPORT:
            return morph(state, {name: action.name})

        case RECEIVE_REPORT:
            return morph(state, {name: null})

        case REQUEST_TIF_JOB:
            return morph(state, {TIFJobIsFetching: true})

        case RECEIVE_TIF_JOB:
            return morph(state, {TIFJobId: action.uuid, TIFJobIsFetching: false})

        case REQUEST_TIF_JOB_STATUS:
            return morph(state, {TIFJobIsFetching: true})

        case RECEIVE_TIF_JOB_STATUS:
            if (action.status === 'success') {
                return morph(state, {TIFJobId: null, TIFJobIsFetching: false})
            }
            else if (action.status === 'failure') {
                return defaultState
            }

            return morph(state, {TIFJobIsFetching: false})

        case FAIL_TIF_JOB:
            return defaultState

        default:
            return state
    }
}
