import resync from '../resync'
import { requestTransfer, receiveTransfer } from '../actions/variables'
import { urlEncode } from '../io'

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

export default store => resync(store, transferSelect, (state, io, dispatch) => {
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
