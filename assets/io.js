import fetch from 'isomorphic-fetch'
import { getCookies } from './utils'

export const urlEncode = data => {
    let items = Object.keys(data).map(item => encodeURIComponent(item) + '=' + encodeURIComponent(data[item]))

    return items.join('&')
}

export const get = url => {
    return fetch(url, {
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json, */*'
        }
    })
}

export const post = (url, data, options = {}) => {
    let { method } = options

    if (!method) {
        method = 'POST'
    }

    if (data) {
        data = JSON.stringify(data)
    }

    return fetch(url, {
        method,
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, */*',
            'X-CSRFToken': getCookies().csrftoken
        },
        body: data
    })
}

export const put = (url, data, options) => post(url, data, Object.assign({method: 'PUT'}, options))

export const ioDelete = (url, options) => post(url, null, Object.assign({method: 'DELETE'}, options))

export const executeGPTask = (job, inputs, statusCallback = null) => {
    let data = {
        job,
        inputs: JSON.stringify(inputs)
    }

    let handleJSONResponse = response => {
        let { status } = response

        if (status >= 200 && status < 300) {
            return response.json()
        }
        else {
            throw new Error('Bad response code:  ' + response.status)
        }
    }

    return post('/geoprocessing/rest/jobs/', data).then(handleJSONResponse).then(json => {
        let { uuid } = json

        return new Promise((resolve, reject) => {
            let pollStatus = () => {
                get('/geoprocessing/rest/jobs/' + uuid + '/').then(handleJSONResponse).then(json => {
                    if (statusCallback !== null) {
                        statusCallback(json)
                    }

                    if (json.status === 'success') {
                        resolve(json)
                    }
                    else if (json.status === 'failure') {
                        let err = new Error('Job failed')
                        err.json = json
                        reject(err)
                    }
                    else {
                        setTimeout(pollStatus, 1000)
                    }
                })
            }

            setTimeout(pollStatus, 1000)
        })
    })
}
