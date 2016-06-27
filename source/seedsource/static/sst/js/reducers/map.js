const defaultState = {
    opacity: 1
}

export default (state=defaultState, action) => {
    switch (action.type) {
        case 'SET_MAP_OPACITY':
            return Object.assign({}, state, {opacity: action.opacity})
        default:
            return state
    }
}
