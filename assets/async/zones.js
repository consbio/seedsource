import resync from '../resync'
import { requestZones, receiveZones, failZones } from '../actions/zones'
import { urlEncode } from '../io'

const zoneSelect = ({ runConfiguration }) => {
    let { point, method, species } = runConfiguration

    return {point, method, species}
}

export default store => resync(store, zoneSelect, ({ point, method, species }, io, dispatch) => {
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
