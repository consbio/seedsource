import { get, post, put, ioDelete } from '../io'
import { setError } from './error'

export const SHOW_SAVE_MODAL = 'SHOW_SAVE_MODAL'
export const HIDE_SAVE_MODAL = 'HIDE_SAVE_MODAL'
export const RECEIVE_SAVE = 'RECEIVE_SAVE'
export const FAIL_SAVE = 'FAIL_SAVE'
export const RESET_CONFIGURATION = 'RESET_CONFIGURATION'
export const LOAD_CONFIGURATION = 'LOAD_CONFIGURATION'
export const REQUEST_SAVE = 'REQUEST_SAVE'
export const RECEIVE_SAVES = 'RECEIVE_SAVES'
export const REQUEST_SAVES = 'REQUEST_SAVES'
export const FAIL_SAVES = 'FAIL_SAVES'
export const REMOVE_SAVE = 'REMOVE_SAVE'

const dumpConfiguration = configuration => {
    let { zones } = configuration

    return Object.assign({}, configuration, {zones: Object.assign({}, zones, {geometry: null})})
}

export const showSaveModal = () => {
    return {
        type: SHOW_SAVE_MODAL
    }
}

export const hideSaveModal = () => {
    return {
        type: HIDE_SAVE_MODAL
    }
}

export const receiveSave = json => {
    return {
        type: RECEIVE_SAVE,
        saveId: json.uuid,
        title: json.title
    }
}

export const resetConfiguration = () => {
    return {
        type: RESET_CONFIGURATION
    }
}

export const loadConfiguration = (configuration, save) => {
    return {
        type: LOAD_CONFIGURATION,
        configuration,
        save
    }
}

export const requestSave = () => {
    return {
        type: REQUEST_SAVE
    }
}

export const failSave = () => {
    return {
        type: FAIL_SAVE
    }
}

export const createSave = (configuration, title) => {
    return dispatch => {
        let data = {
            title,
            configuration: JSON.stringify(dumpConfiguration(configuration))
        }

        dispatch(requestSave())

        return post('/sst/run-configurations/', data).then(response => {
            let { status } = response

            if (status >= 200 && status < 300) {
                return response.json()
            }
            else {
                throw new Error('Bad status creating save: ' + response.status)
            }

            return response.json()
        }).then(json => {
            dispatch(receiveSave(json))
            dispatch(fetchSaves())
        }).catch(err => {
            console.log(err)

            dispatch(failSave())
            dispatch(setError('Save error', 'Sorry, there was an error saving the configuration', JSON.stringify({
                action: 'createSave',
                error: err ? err.message : null,
                data
            }, null, 2)))
        })
    }
}

export const updateSave = (configuration, lastSave) => {
    return dispatch => {
        let data = {
            title: lastSave.title,
            configuration: JSON.stringify(dumpConfiguration(configuration))
        }

        dispatch(requestSave())

        let url = '/sst/run-configurations/' + lastSave.saveId + '/'

        return put(url, data).then(response => {
            let { status } = response

            if (status >= 200 && status < 300) {
                return response.json()
            }
            else {
                throw new Error('Bad status creating save: ' + response.status)
            }

            return response.json()
        }).then(json => {
            dispatch(receiveSave(json))
            dispatch(fetchSaves())
        }).catch(err => {
            console.log(err)

            dispatch(failSave())
            dispatch(setError('Save error', 'Sorry, there was an error saving the configuration', JSON.stringify({
                action: 'updateSave',
                error: err ? err.message : null,
                data
            }, null, 2)))
        })
    }
}

export const receiveSaves = saves => {
    return {
        type: RECEIVE_SAVES,
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
        type: REQUEST_SAVES
    }
}

export const failSaves = () => {
    return {
        type: FAIL_SAVES
    }
}

export const fetchSaves = () => {
    return (dispatch, getState) => {
        let { isLoggedIn } = getState()

        if (isLoggedIn) {
            dispatch(requestSaves())

            return get('/sst/run-configurations/').then(response => {
                let {status} = response

                if (status >= 200 && status < 300) {
                    return response.json()
                }
                else {
                    throw new Error('Bad status loading saves: ' + response.status)
                }
            }).then(json => dispatch(receiveSaves(json.results))).catch(err => {
                console.log(err)
                dispatch(receiveSaves([]))
            })
        }
    }
}

export const removeSave = uuid => {
    return {
        type: REMOVE_SAVE,
        uuid
    }
}

export const deleteSave = uuid => {
    return dispatch => {
        let url = '/sst/run-configurations/' + uuid + '/'

        return ioDelete(url).then(response => {
            let { status } = response

            if (status >= 200 && status < 300) {
                dispatch(removeSave(uuid))
            }
            else {
                throw new Error('Bad status deleting save: ' + response.status)
            }
        }).catch(err => console.log(err))
    }
}
