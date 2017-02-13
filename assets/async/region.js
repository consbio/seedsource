import resync from '../resync'
import { selectRegion, requestRegions, receiveRegions } from '../actions/region'
import { urlEncode } from '../io'
import { pointSelect } from '../utils'

export default store => {
    resync(store, pointSelect, ({point}, io, dispatch) => {
        let pointIsValid = point !== null && point.x && point.y

        if (pointIsValid) {
            let url = '/sst/regions/?' + urlEncode({
                point: point.x + ',' + point.y
            })

            dispatch(requestRegions())

            io.get(url).then(response => response.json()).then(json => {
                let results = json.results
                if (results.length) {
                    let region = results[0].name
                    let validRegions = results.map((a) => {return a.name})

                    dispatch(receiveRegions(validRegions))  // always update which regions are valid

                    let { regionMethod } = store.getState().runConfiguration

                    if (regionMethod === 'auto') {
                        dispatch(selectRegion(region))
                    }
                }
            })
        }
    })
}
