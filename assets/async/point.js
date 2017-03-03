import resync from '../resync'
import { setElevation } from '../actions/point'
import { setRegion, requestRegions, receiveRegions } from '../actions/region'
import { requestValue, receiveValue } from '../actions/variables'
import { fetchValues } from '../async/variables'
import { urlEncode } from '../io'

const pointSelect = ({ runConfiguration }) => {
    let { point } = runConfiguration

    if (point) {
        point = {x: point.x, y: point.y}
    }

    return {point}
}

export default store => {
    resync(store, pointSelect, (state, io, dispatch, previousState) => {
        let { point } = state
        let pointIsValid = point !== null && point.x && point.y

        if (pointIsValid) {

            dispatch(setElevation(null))
            dispatch(requestRegions())
            let regionUrl = '/sst/regions/?' + urlEncode({
                point: point.x + ',' + point.y
            })

            io.get(regionUrl).then(response => response.json()).then(json => {
                let results = json.results
                let validRegions = results.map((a) => {
                    return a.name
                })

                dispatch(receiveRegions(validRegions))  // Always update valid regions

                let region = ''
                if (validRegions.length) {
                    region = validRegions[0]
                }

                if (store.getState().runConfiguration.regionMethod === 'auto') {
                    dispatch(setRegion(region))
                }
                return region
            }).then(region => {

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

                let requests = fetchValues(store, state, io, dispatch, previousState, region)

                if (requests) {
                    requests.forEach(request => {
                        dispatch(requestValue(request.item.name))
                        request.promise.then(json => dispatch(receiveValue(request.item.name, json)))
                    })
                }
            })
        }
    })
}
