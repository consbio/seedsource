import resync from '../resync'
import { urlEncode } from '../io'
import { receivePopupElevation } from '../actions/popup'

const popupSelect = ({ popup }) => {
    let { point } = popup

    return {point}
}

export default store => resync(store, popupSelect, (state, io, dispatch) => {
    let { point } = state

    if (point !== null) {
        let url = '/arcgis/rest/services/west2_dem/MapServer/identify/?' + urlEncode({
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

            dispatch(receivePopupElevation(value))
        })
    }
})
