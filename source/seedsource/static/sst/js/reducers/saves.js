const defaultState = {
    showModal: false,
    isSaving: false,
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

        default:
            return state
    }
}
