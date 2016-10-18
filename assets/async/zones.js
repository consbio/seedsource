import resync from '../resync'
import {
    requestZones, receiveZones, failZones, requestGeometry, receiveGeometry, failGeometry
} from '../actions/zones'
import { urlEncode } from '../io'

const zoneSelect = ({ runConfiguration }) => {
    let { point, method, species } = runConfiguration

    if (point) {
        point = {x: point.x, y: point.y}
    }

    return {point, method, species}
}

const zoneGeometrySelect = ({ runConfiguration }) => {
    let { zones } = runConfiguration
    let { selected, geometry } = zones

    return {
        zone: selected,
        hasGeometry: geometry !== null
    }
}

export default store => {
    // Zones
    resync(store, zoneSelect, ({ point, method, species }, io, dispatch) => {
        let pointIsValid = point !== null && point.x && point.y

        if (method === 'seedzone' && pointIsValid) {
            dispatch(requestZones())

            let url = '/sst/seedzones/?' + urlEncode({
                    point: point.x + ',' + point.y,
                    species
                })

            return io.get(url)
                .then(response => response.json())
                .then(json => dispatch(receiveZones(json.results)))
                .catch(err => {
                    console.log(err)

                    dispatch(failZones())
                })
        }
    })

    // Zone geometry
    resync(store, zoneGeometrySelect, ({zone, hasGeometry}, io, dispatch) => {
        if (zone !== null && !hasGeometry) {
            dispatch(requestGeometry())

            let url = '/sst/seedzones/' + store.getState().runConfiguration.zones.selected + '/geometry/'

            return io.get(url)
                .then(response => response.json())
                .then(json => dispatch(receiveGeometry(json)))
                .catch(err => {
                    console.log(err)

                    dispatch(failGeometry())
                })
        }
    })
}
