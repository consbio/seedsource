export default (state = null, action) => {
    switch(action.type) {
        case 'SET_LATITUDE':
            return {x: state ? state.x : '', y: action.value}

        case 'SET_LONGITUDE':
            return {x: action.value, y: state ? state.y : ''}

        default:
            return state
    }
}
