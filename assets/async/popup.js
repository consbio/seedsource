import resync from '../resync'
import { urlEncode } from '../io'
import {
    receivePopupElevation, requestPopupValue, receivePopupValue, requestPopupRegion, receivePopupRegion
} from '../actions/popup'
import { fetchValues } from '../async/variables'

const popupSelect = ({ popup }) => {
    let { point } = popup

    return {point}
}

export default store => resync(store, popupSelect, (state, io, dispatch, previousState) => {
    let { point } = state
    let pointIsValid = point !== null && point.x && point.y

    if (pointIsValid) {

        // Update popup regions
        let regionUrl = '/sst/regions/?' + urlEncode({
                point: point.x + ',' + point.y
            })

        dispatch(requestPopupRegion())

        io.get(regionUrl).then(response => response.json()).then(json => {
            let results = json.results
            let validRegions = results.map((a) => {
                return a.name
            })

            let region = ''
            if (validRegions.length) {
                region = validRegions[0]
            }
            dispatch(receivePopupRegion(region))
            return region
        }).then(region => {

            if (region !== '') {

                // Set elevation at point
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

                    dispatch(receivePopupElevation(value))
                })

                // Set values at point
                let requests = fetchValues(store, state, io, dispatch, previousState, region)
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
