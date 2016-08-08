import { SET_ERROR, CLEAR_ERROR } from '../actions/error'

export default (state = null, action) => {
    switch (action.type) {
        case SET_ERROR:
            let {title, message, debugInfo} = action

            return {title, message, debugInfo}

        case CLEAR_ERROR:
            return null

        default:
            return state
    }
}
