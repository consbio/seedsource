import fetch from 'isomorphic-fetch'
import { getCookies } from './utils'

export const urlEncode = data => {
    let items = Object.keys(data).map(item => encodeURIComponent(item) + '=' + encodeURIComponent(data[item]))

    return items.join('&')
}

export const get = url => {
    return fetch(url, {credentials: 'same-origin'})
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
            'X-CSRFToken': getCookies().csrftoken
        },
        body: data
    })
}

export const put = (url, data, options) => post(url, data, Object.assign({method: 'PUT'}, options))

export const ioDelete = (url, options) => post(url, null, Object.assign({method: 'DELETE'}, options))
