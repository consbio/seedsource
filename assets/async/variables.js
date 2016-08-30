import resync from '../resync'
import { requestTransfer, receiveTransfer, requestValue, receiveValue } from '../actions/variables'
import { urlEncode } from '../io'
import { getServiceName } from '../utils'

const transferSelect = ({ runConfiguration }) => {
    let { method, point, zones, climate, variables } = runConfiguration

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

    return {
        objective,
        point,
        climate,
        variables: variables.map(item => item.name)
    }
}

export default store => {
    // Transfer limit information
    resync(store, transferSelect, ({ method, point, zone, year }, io, dispatch) => {
        let pointIsValid = point !== null && point.x && point.y
        let { runConfiguration } = store.getState()

        if (!(pointIsValid && method === 'seedzone')) {
            return
        }

        // Only need to fetch transfer for variables which don't have one
        runConfiguration.variables.filter(item => item.defaultTransfer === null).forEach(item => {
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

    // Value at point
    resync(store, valueSelect, ({ objective, point }, io, dispatch) => {
        let pointIsValid = point !== null && point.x && point.y
        let { variables, climate } = store.getState().runConfiguration

        if (!pointIsValid) {
            return
        }

        // Only need to fetch value for variables which don't have one
        variables.filter(item => item.value === null).forEach(item => {
            dispatch(requestValue(item.name))

            let serviceName = getServiceName(item.name, objective, climate)
            let url = '/arcgis/rest/services/' + serviceName + '/MapServer/identify/?' + urlEncode({
                f: 'json',
                tolerance: 2,
                imageDisplay: '1600,1031,96',
                geometryType: 'esriGeometryPoint',
                mapExtent: '0,0,0,0',
                geometry: JSON.stringify(point)
            })

            return io.get(url).then(response => response.json()).then(json => dispatch(receiveValue(item.name, json)))
        })
    })
}
