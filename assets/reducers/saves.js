import {
    SHOW_SAVE_MODAL, HIDE_SAVE_MODAL, RECEIVE_SAVE, REQUEST_SAVE, FAIL_SAVE, REQUEST_SAVES, RECEIVE_SAVES, FAIL_SAVES,
    REMOVE_SAVE, LOAD_CONFIGURATION
} from '../actions/saves'
import { morph } from '../utils'

const defaultState = {
    showModal: false,
    isSaving: false,
    isFetching: false,
    lastSave: null,
    saves: []
}

export default (state = defaultState, action) => {
    switch(action.type) {
        case SHOW_SAVE_MODAL:
            return morph(state, {showModal: true})

        case HIDE_SAVE_MODAL:
            return morph(state, {showModal: false})

        case RECEIVE_SAVE:
            let { title, saveId } = action

            return morph(state, {
                showModal: false,
                isSaving: false,
                lastSave: {title, saveId}
            })

        case FAIL_SAVE:
            return morph(state, {isSaving: false})

        case REQUEST_SAVE:
            return morph(state, {isSaving: true})

        case REQUEST_SAVES:
            return morph(state, {isFetching: true})

        case RECEIVE_SAVES:
            return morph(state, {isFetching: false, saves: action.saves})

        case FAIL_SAVES:
            return morph(state, {isFetching: false})

        case LOAD_CONFIGURATION:
            let { save } = action
            return morph(state, {lastSave: {title: save.title, saveId: save.uuid}})

        case REMOVE_SAVE:
            let { lastSave, saves } = state
            
            return morph(state, {
                saves: saves.filter(item => item.uuid !== action.uuid),
                lastSave: lastSave !== null && lastSave.saveId === action.uuid ? null : lastSave
            })

        default:
            return state
    }
}
