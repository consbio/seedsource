export default (state = 'configuration', action) => {
    switch (action.type) {
        case 'SELECT_TAB':
            return action.tab

        default:
            return state
    }
}
