import resync from '../resync'
import { selectRegion } from '../actions/region'
import { urlEncode } from '../io'
import { pointSelect } from '../utils'

export default store => {
    resync(store, pointSelect, ({point}, io, dispatch) => {
        let pointIsValid = point !== null && point.x && point.y

        if (pointIsValid) {
            let url = '/sst/region/?' + urlEncode({
                point: point.x + ',' + point.y
            })

            io.get(url).then(response => response.json()).then(json => {
                let region = json.name
                if (region) {
                    dispatch(selectRegion(region))
                }
            })
        }
    })
}
