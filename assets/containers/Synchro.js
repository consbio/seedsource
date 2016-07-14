/**
 * This is a non-rendering component designed to help decide when to make an asynchronous request, and then handling
 * the request/response mechanics. The default behavior is to make a request whenever the `hash` property has changed
 * from the last successful response. It's important that actions dispatched after a successful request do NOT
 * ultimately modify any properties used to determine if the request should be made. Otherwise, you could end up with
 * endless requests.
 */

import React, { PropTypes } from 'react'
import uuid from 'node-uuid'

class Synchro extends React.Component {
    constructor(props) {
        super(props)
        this.requestUUID = null
        this.oldHash = null
    }

    shouldMakeRequest(newHash) {
        let { shouldMakeRequest } = this.props

        if (shouldMakeRequest !== undefined) {
            return shouldMakeRequest()
        }
        else {
            return newHash !== this.oldHash
        }
    }

    componentDidMount() {
        if (this.shouldMakeRequest(this.props.hash)) {
            this.createRequest()
        }
    }

    componentWillUnmount() {
        this.requestUUID = null
    }

    componentDidUpdate() {
        if (this.shouldMakeRequest(this.props.hash)) {
            this.createRequest()
        }
    }

    createRequest() {
        let { hash, createRequest, onSuccess, onError } = this.props

        this.oldHash = hash

        let promise = createRequest()

        if (promise !== null && promise !== undefined) {
            let requestUUID = uuid.v4()
            this.requestUUID = requestUUID

            promise.then(response => {
                if (requestUUID === this.requestUUID) {
                    if (onSuccess !== undefined) {
                        onSuccess(response)
                    }
                }
            }).catch(error => {
                if (requestUUID === this.requestUUID) {
                    if (onError !== undefined) {
                        onError(error)
                    }
                    else {
                        console.error(error)
                    }
                }
            })
        }
    }

    render() {
        return null
    }
}

Synchro.propTypes = {
    shouldMakeRequest: PropTypes.func,
    createRequest: PropTypes.func.isRequired,
    onSuccess: PropTypes.func,
    onError: PropTypes.func
}

export default Synchro
