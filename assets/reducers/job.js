import { REQUEST_JOB, RECEIVE_JOB, REQUEST_JOB_STATUS, RECEIVE_JOB_STATUS, FAIL_JOB } from '../actions/job'
import { LOAD_CONFIGURATION } from '../actions/saves'

const defaultState = {
    isRunning: false,
    isFetching: false,
    jobId: null,
    serviceId: null,
    configuration: null
}

export default (state = defaultState, action) => {
    switch(action.type) {
        case REQUEST_JOB:
            return Object.assign({}, defaultState, {
                isRunning: true,
                isFetching: true,
                configuration: action.configuration
            })

        case RECEIVE_JOB:
            return Object.assign({}, state, {jobId: action.jobId, isFetching: false})

        case REQUEST_JOB_STATUS:
            return Object.assign({}, state, {isFetching: true})

        case RECEIVE_JOB_STATUS:
            if (action.status === 'success') {
                return Object.assign({}, state, {isRunning: false, isFetching: false, serviceId: action.serviceId})
            }
            else if (action.status === 'failure') {
                return defaultState
            }

            return Object.assign({}, state, {isFetching: false})

        case FAIL_JOB:
            return defaultState

        case LOAD_CONFIGURATION:
            return defaultState

        default:
            return state
    }
}
