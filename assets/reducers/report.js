import { REQUEST_REPORT, RECEIVE_REPORT } from '../actions/report'
import { morph } from '../utils'

const defaultState = {
    name: null
}

export default (state = defaultState, action) => {
    switch (action.type) {
        case REQUEST_REPORT:
            return morph(state, {name: action.name})

        case RECEIVE_REPORT:
            return morph(state, {name: null, TIFJobIsFetching: false})

        default:
            return state
    }
}
