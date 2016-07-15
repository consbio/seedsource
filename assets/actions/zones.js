import fetch from 'isomorphic-fetch'

export const selectZone = zone => {
    return {
        type: 'SELECT_ZONE',
        zone
    }
}

export const requestZones = () => {
    return {
        type: 'REQUEST_ZONES'
    }
}

export const receiveZones = zones => {
    return {
        type: 'RECEIVE_ZONES',
        zones
    }
}

export const fetchZones = () => {
    return (dispatch, getState) => {
        let { runConfiguration } = getState()
        let { species, point, zones } = runConfiguration
        let { isFetchingZones } = zones
        let pointIsValid = point !== null && point.x !== null && point.y !== null

        if (pointIsValid && !isFetchingZones) {
            dispatch(requestZones())

            let url = '/sst/seedzones/?point=' + point.x + ',' + point.y

            if (species !== 'generic') {
                url += '&species=' + species
            }

            return fetch(url, {credentials: 'same-origin'})
                .then(response => response.json())
                .then(json => dispatch(receiveZones(json.results)))
        }

        return Promise.resolve()
    }
}

export const requestGeometry = () => {
    return {
        type: 'REQUEST_GEOMETRY'
    }
}

export const receiveGeometry = geometry => {
    return {
        type: 'RECEIVE_GEOMETRY',
        geometry
    }
}

export const fetchGeometry = () => {
    return (dispatch, getState) => {
        let { runConfiguration } = getState()
        let { zones } = runConfiguration
        let { selected, isFetchingGeometry } = zones

        if (selected !== null && !isFetchingGeometry) {
            dispatch(requestGeometry())

            let url = '/sst/seedzones/' + selected + '/geometry/'

            return fetch(url, {credentials: 'same-origin'})
                .then(response => response.json())
                .then(json => dispatch(receiveGeometry(json)))
        }

        return Promise.resolve()
    }
}
