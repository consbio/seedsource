import resync from '../resync'
import { requestTransfer, receiveTransfer, requestValue, receiveValue } from '../actions/variables'
//import { requestPopupValue, receivePopupValue } from '../actions/popup'
import { urlEncode } from '../io'
import { getServiceName, morph } from '../utils'

const transferSelect = ({ runConfiguration }) => {
    let { method, point, zones, climate, variables } = runConfiguration

    if (point) {
        point = {x: point.x, y: point.y}
    }

    return {
        method,
        point,
        zone: zones.selected,
        year: climate.seedlot.time,
        variables: variables.map(item => item.name)
    }
}

const valueSelect = ({ runConfiguration }) => {
    let { objective, point, climate, variables } = runConfiguration

    if (point) {
        point = {x: point.x, y: point.y}
    }


    return {
        objective,
        point,
        climate,
        variables: variables.map(item => item.name)
    }
}

const popupSelect = ({ runConfiguration, popup }) => {
    let { objective, climate, variables } = runConfiguration
    let { point } = popup

    if (point) {
        point = {x: point.x, y: point.y}
    }

    return {
        objective,
        point,
        climate,
        variables: variables.map(item => item.name)
    }
}

export const fetchValues = (store, state, io, dispatch, previousState) => {
    let { objective, point } = state
    let pointIsValid = point !== null && point.x && point.y
    let { variables, climate, validRegions } = store.getState().runConfiguration

    if (!(pointIsValid && validRegions.length)) {
        return
    }

    let region = validRegions[0]

    // If only variables have changed, then not all variables need to be refreshed
    let variablesOnly = (
        JSON.stringify(morph(state, {variables: null})) === JSON.stringify(morph(previousState, {variables: null}))
    )
    if (variablesOnly) {
        variables = variables.filter(item => item.defaultTransfer === null)
    }

    let requests = variables.map(item => {
        let serviceName = getServiceName(item.name, objective, climate, region)
        let url = '/arcgis/rest/services/' + serviceName + '/MapServer/identify/?' + urlEncode({
            f: 'json',
            tolerance: 2,
            imageDisplay: '1600,1031,96',
            geometryType: 'esriGeometryPoint',
            mapExtent: '0,0,0,0',
            geometry: JSON.stringify(point)
        })

        return {item, promise: io.get(url).then(response => response.json())}
    })

    return requests
}

export default store => {
    // Transfer limit information
    resync(store, transferSelect, (state, io, dispatch, previousState) => {
        let { method, point, zone, year } = state
        let pointIsValid = point !== null && point.x && point.y
        let { runConfiguration } = store.getState()
        let { variables } = runConfiguration

        if (!(pointIsValid && method === 'seedzone')) {
            return
        }

        // If only variables have changed, then not all variables need to be refreshed
        let variablesOnly = (
            JSON.stringify(morph(state, {variables: null})) === JSON.stringify(morph(previousState, {variables: null}))
        )

        if (variablesOnly) {
            variables = variables.filter(item => item.defaultTransfer === null)
        }

        // Only need to fetch transfer for variables which don't have one
        variables.forEach(item => {
            dispatch(requestTransfer(item.name))

            let url = '/sst/transfer-limits/?' + urlEncode({
                    point: point.x + ',' + point.y,
                    variable: item.name,
                    zone__zone_uid: zone,
                    time_period: year
                })

            return io.get(url).then(response => response.json()).then(json => {
                if (json.results.length) {
                    let { transfer, avg_transfer, center } = json.results[0]

                    dispatch(receiveTransfer(item.name, transfer, avg_transfer, center))
                }
                else {
                    dispatch(receiveTransfer(item.name, null, null, null))
                }
            }).catch(() => dispatch(receiveTransfer(item.name, null, null, null)))
        })
    })

    // Values at point (for variables list)
    resync(store, valueSelect, (state, io, dispatch, previousState) => {
        let requests = fetchValues(store, state, io, dispatch, previousState)

        if (requests) {
            requests.forEach(request => {
                dispatch(requestValue(request.item.name))
                request.promise.then(json => dispatch(receiveValue(request.item.name, json)))
            })
        }
    })

    // Values at point (for popup)
    //resync(store, popupSelect, (state, io, dispatch, previousState) => {
    //    let requests = fetchValues(store, state, io, dispatch, previousState)
//
    //    if (requests) {
    //        requests.forEach(request => {
    //            dispatch(requestPopupValue(request.item.name))
    //            request.promise.then(json => dispatch(receivePopupValue(request.item.name, json)))
    //        })
    //    }
    //})
}
