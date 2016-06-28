const defaultState = {
    isRunning: false,
    isFetching: false,
    jobId: null,
    serviceId: null,
    configuration: null
}

export default (state = defaultState, action) => {
    switch(action.type) {
        case 'REQUEST_JOB':
            return Object.assign({}, defaultState, {
                isRunning: true,
                isFetching: true,
                configuration: action.configuration
            })

        case 'RECEIVE_JOB':
            return Object.assign({}, state, {jobId: action.jobId, isFetching: false})

        case 'REQUEST_JOB_STATUS':
            return Object.assign({}, state, {isFetching: true})

        case 'RECEIVE_JOB_STATUS':
            if (action.status === 'success') {
                return Object.assign({}, state, {isRunning: false, isFetching: false, serviceId: action.serviceId})
            }

            return Object.assign({}, state, {isFetching: false})

        case 'LOAD_CONFIGURATION':
            return defaultState

        default:
            return state
    }
}
