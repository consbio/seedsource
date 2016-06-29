const defaultState = {
    opacity: 1,
    showResults: true
}

export default (state=defaultState, action) => {
    switch (action.type) {
        case 'SET_MAP_OPACITY':
            return Object.assign({}, state, {opacity: action.opacity})

        case 'TOGGLE_VISIBILITY':
            return Object.assign({}, state, {showResults: !state.showResults})

        case 'FINISH_JOB':
            return Object.assign({}, state, {showResults: true})

        default:
            return state
    }
}
