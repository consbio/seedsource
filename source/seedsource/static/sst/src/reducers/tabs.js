export default (state = 'configuration', action) => {
    switch (action.type) {
        case 'SELECT_TAB':
            return action.tab

        case 'LOAD_CONFIGURATION':
            return 'configuration'

        default:
            return state
    }
}
