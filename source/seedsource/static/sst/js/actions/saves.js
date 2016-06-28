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

export const loadConfiguration = (configuration, save) => {
    return {
        type: 'LOAD_CONFIGURATION',
        configuration,
        save
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
        }).then(response => response.json()).then(json => {
            dispatch(receiveSave(json))
            dispatch(fetchSaves())
        })
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
        }).then(response => response.json()).then(json => {
            dispatch(receiveSave(json))
            dispatch(fetchSaves())
        })
    }
}

export const receiveSaves = saves => {
    return {
        type: 'RECEIVE_SAVES',
        saves: saves.map(item => {
            let { modified, configuration } = item

            return Object.assign(item, {
                modified: new Date(modified),
                configuration: JSON.parse(configuration)
            })
        })
    }
}

export const requestSaves = () => {
    return {
        type: 'REQUEST_SAVES'
    }
}

export const fetchSaves = () => {
    return dispatch => {
        dispatch(requestSaves())

        return fetch('/sst/run-configurations/', {
            credentials: 'same-origin'
        }).then(response => response.json()).then(json => dispatch(receiveSaves(json)))
    }
}
