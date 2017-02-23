import resync from '../resync'
import { urlEncode } from '../io'
import { selectRegion, requestRegions, receiveRegions } from '../actions/region'
import { receivePopupElevation, requestPopupValue, receivePopupValue } from '../actions/popup'
import { fetchValues } from '../async/variables'

const popupSelect = ({ popup }) => {
    let { point } = popup

    return {point}
}

export default store => resync(store, popupSelect, (state, io, dispatch, previousState) => {
    let { point } = state
    let pointIsValid = point !== null && point.x && point.y


    if (pointIsValid) {
        // Update regions from this point
        let regionUrl = '/sst/regions/?' + urlEncode({
                point: point.x + ',' + point.y
            })

        dispatch(requestRegions())

        io.get(regionUrl).then(response => response.json()).then(json => {
            let results = json.results
            if (results.length) {
                let region = results[0].name
                let validRegions = results.map((a) => {
                    return a.name
                })

                dispatch(receiveRegions(validRegions))  // always update which regions are valid

                let { regionMethod } = store.getState().runConfiguration

                if (regionMethod === 'auto') {
                    dispatch(selectRegion(region))
                }
            }
        }).then(() => {

            // Set values from point location and nearest valid region
            let { validRegions } = store.getState().runConfiguration
            if (validRegions.length) {

                // Set elevation at point
                let region = validRegions[0]
                let url = '/arcgis/rest/services/' + region + '_dem/MapServer/identify/?' + urlEncode({
                        f: 'json',
                        tolerance: '2',
                        imageDisplay: '1600,1031,96',
                        geometryType: 'esriGeometryPoint',
                        mapExtent: '0,0,0,0',
                        geometry: JSON.stringify({x: point.x, y: point.y})
                    })

                io.get(url).then(response => response.json()).then(json => {
                    // Set elevation value
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

                // Set values at point
                let requests = fetchValues(store, state, io, dispatch, previousState)
                if (requests) {
                    requests.forEach(request => {
                        dispatch(requestPopupValue(request.item.name))
                        request.promise.then(json => dispatch(receivePopupValue(request.item.name, json)))
                    })
                }

            }
        })
    }
})
