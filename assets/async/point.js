import resync from '../resync'
import { setElevation } from '../actions/point'
import { urlEncode } from '../io'
import { pointSelect } from '../utils'

export default store => {
    resync(store, pointSelect, ({ point }, io, dispatch) => {
        let pointIsValid = point !== null && point.x && point.y
        let { validRegions } = store.getState().runConfiguration
        if (!validRegions.length) {
            return
        }
        let region = validRegions[0]
        dispatch(setElevation(null))

        if (pointIsValid) {

            let url = '/arcgis/rest/services/' + region + '_dem/MapServer/identify/?' + urlEncode({
                f: 'json',
                tolerance: '2',
                imageDisplay: '1600,1031,96',
                geometryType: 'esriGeometryPoint',
                mapExtent: '0,0,0,0',
                geometry: JSON.stringify({x: point.x, y: point.y})
            })

            io.get(url).then(response => response.json()).then(json => {
                let results = json.results
                let value = null

                if (results.length) {
                    value = results[0].attributes['Pixel value']
                }

                if (isNaN(value)) {
                    value = null
                }

                dispatch(setElevation(value))
            })
        }
    })
}
