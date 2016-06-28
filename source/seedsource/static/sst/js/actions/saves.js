import fetch from 'isomorphic-fetch'
import { getCookies } from '../utils'

export const showSaveModal = () => {
    return {
        type: 'SHOW_SAVE_MODAL'
    }
}

export const hideSaveModal = () => {
    return {
        type: 'HIDE_SAVE_MODAL'
    }
}

export const receiveSave = json => {
    return {
        type: 'RECEIVE_SAVE',
        saveId: json.uuid,
        title: json.title
    }
}

export const requestSave = () => {
    return {
        type: 'REQUEST_SAVE'
    }
}

export const createSave = (configuration, title) => {
    return dispatch => {
        let data = {
            title,
            configuration: JSON.stringify(configuration)
        }

        dispatch(requestSave())

        return fetch('/sst/run-configurations/', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookies().csrftoken
            },
            body: JSON.stringify(data)
        }).then(response => response.json()).then(json => dispatch(receiveSave(json)))
    }
}

export const updateSave = (configuration, lastSave) => {
    return dispatch => {
        let data = {
            title: lastSave.title,
            configuration: JSON.stringify(configuration)
        }

        dispatch(requestSave())

        let url = '/sst/run-configurations/' + lastSave.saveId + '/'

        return fetch(url, {
            method: 'PUT',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookies().csrftoken
            },
            body: JSON.stringify(data)
        }).then(response => response.json()).then(json => dispatch(receiveSave(json)))
    }
}
