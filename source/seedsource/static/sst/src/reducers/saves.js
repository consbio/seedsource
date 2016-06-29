const defaultState = {
    showModal: false,
    isSaving: false,
    isFetching: false,
    lastSave: null,
    saves: []
}

export default (state = defaultState, action) => {
    switch(action.type) {
        case 'SHOW_SAVE_MODAL':
            return Object.assign({}, state, {showModal: true})

        case 'HIDE_SAVE_MODAL':
            return Object.assign({}, state, {showModal: false})

        case 'RECEIVE_SAVE':
            let { title, saveId } = action

            return Object.assign({}, state, {
                showModal: false,
                isSaving: false,
                lastSave: {title, saveId}
            })

        case 'REQUEST_SAVE':
            return Object.assign({}, state, {isSaving: true})

        case 'REQUEST_SAVES':
            return Object.assign({}, state, {isFetching: true})

        case 'RECEIVE_SAVES':
            return Object.assign({}, state, {isFetching: false, saves: action.saves})

        case 'LOAD_CONFIGURATION':
            let { save } = action
            return Object.assign({}, state, {lastSave: {title: save.title, saveId: save.uuid}})

        case 'REMOVE_SAVE':
            let { lastSave, saves } = state
            
            return Object.assign({}, state, {
                saves: saves.filter(item => item.uuid !== action.uuid),
                lastSave: lastSave !== null && lastSave.saveId === action.uuid ? null : lastSave
            })

        default:
            return state
    }
}
