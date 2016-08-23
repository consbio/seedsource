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
        climate: objective === 'seedlots' ? climate.site : climate.seedlot,
        variables: variables.map(item => item.name)
    }
}

export default store => {
    // Transfer information
    resync(store, transferSelect, (state, io, dispatch) => {
        let { method, point, zone, year, variables } = state
        let pointIsValid = point !== null && point.x && point.y

        if (!(pointIsValid && method === 'seedzone')) {
            return
        }

        variables.forEach(item => {
            dispatch(requestTransfer(item.name))

            let url = '/sst/transfer-limits/?' + urlEncode({
                    point: point.x + ',' + point.y,
                    variable: item,
                    zone__zone_uid: zone,
                    time_period: year
                })

            return io.get(url).then(response => response.json()).then(json => {
                if (json.results.length) {
                    let { transfer, avg_transfer, center } = json.results[0]

                    dispatch(receiveTransfer(item, transfer, avg_transfer, center))
                }
                else {
                    dispatch(receiveTransfer(item, null, null, null))
                }
            }).catch(() => dispatch(receiveTransfer(item, null, null, null)))
        })
    })

    // Value at point
    resync(store, valueSelect, ({ objective, point, variables }, io, dispatch) => {
        let pointIsValid = point !== null && point.x && point.y

        if (!pointIsValid) {
            return
        }

        variables.forEach(item => {
            dispatch(requestValue(item))

            let serviceName = getServiceName(item, objective, store.getState().runConfiguration.climate)
            let url = '/arcgis/rest/services/' + serviceName + '/MapServer/identify/?' + urlEncode({
                f: 'json',
                tolerance: 2,
                imageDisplay: '1600,1031,96',
                geometryType: 'esriGeometryPoint',
                mapExtent: '0,0,0,0',
                geometry: JSON.stringify(point)
            })

            return io.get(url).then(response => response.json()).then(json => dispatch(receiveValue(item, json)))
        })
    })
}
