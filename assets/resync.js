import uuid from 'uuid'
import { get, post, put, ioDelete } from './io'

class Request {
    constructor() {
        this.promiseUUID = null
    }

    _handlePromise(promise) {
        let promiseUUID = this.promiseUUID

        return promise.then(response => {
            if (promiseUUID === this.promiseUUID) {
                return response
            }
            else {
                return Promise.reject()
            }
        })
    }

    get(url) {
        return this._handlePromise(get(url))
    }

    post(url, data, options) {
        return this._handlePromise(post(url, data, options))
    }

    put(url, data, options) {
        return this._handlePromise(put(url, data, options))
    }

    ioDelete(url, options) {
        return this._handlePromise(ioDelete(url, options))
    }
}

export default (store, select, fetchData) => {
    let currentState
    let io = new Request()

    return store.subscribe(() => {
        let nextState = select(store.getState())

        if (JSON.stringify(nextState) !== JSON.stringify(currentState)) {
            let previousState = currentState

            currentState = nextState
            io.promiseUUID = uuid.v4()

            fetchData(currentState, io, store.dispatch, previousState)
        }
    })
}
