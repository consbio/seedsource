/**
 * This component ensures that the Leaflet map state reflects the redux application state, and dispatches map-related
 * events via redux.
 */

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { setMapOpacity } from '../actions/map'
import { setPoint } from '../actions/point'
import { getServiceName } from '../utils'

class MapConnector extends React.Component {
    constructor(props) {
        super(props)
        this.map = null
        this.pointMarker = null
        this.variableLayer = null
    }

    // Initial map setup
    componentWillMount() {
        this.map = L.map('Map', {
            zoom: 5,
            center: [44.68, -109.36]
        })

        this.map.zoomControl.setPosition('topright')

        this.map.addControl(L.control.basemaps({
            basemaps: [
                L.tileLayer('//{s}.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
                    maxZoom: 16,
                    subdomains: ['server', 'services']
                }),
                L.tileLayer(
                    '//{s}.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
                    maxZoom: 16,
                    subdomains: ['server', 'services']
                }),
                L.tileLayer(
                    '//{s}.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
                    maxZoom: 16,
                    subdomains: ['server', 'services']
                })
            ],
            tileX: 0,
            tileY: 0,
            tileZ: 1,
            position: 'bottomleft'
        }))

        this.map.addControl(L.control.zoomBox({position: 'topright'}))

        let opacityControl = L.control.opacity()
        this.map.addControl(opacityControl)

        opacityControl.on('change', e => {
            this.props.onOpacityChange(e.value / 100)
        })

        this.map.on('click', e => {
            this.props.onMapClick(e.latlng.lat, e.latlng.lng)
        })
    }

    updatePointMarker(point) {
        let pointIsValid = point !== null && point.x !== null && point.y !== null

        if (pointIsValid) {
            if (this.pointMarker === null) {
                this.pointMarker = L.marker([point.y, point.x]).addTo(this.map)
            }
            else {
                this.pointMarker.setLatLng([point.y, point.x])
            }
        }
        else if (this.pointMarker !== null) {
            this.map.removeLayer(this.pointMarker)
            this.pointMarker = null
        }
    }

    updateVariableLayer(variable, objective, region, time, model) {
        if (variable !== null) {
            let layerUrl = '/tiles/' + getServiceName(variable, objective, time, model) + '/{z}/{x}/{y}.png'
            if (this.variableLayer === null) {
                this.variableLayer = L.tileLayer(layerUrl, {zIndex: 1, opacity: 1}).addTo(this.map)
            }
            else if(layerUrl !== this.variableLayer._url) {
                this.variableLayer.setUrl(layerUrl)
            }
        }
        else if (this.variableLayer !== null) {
            this.map.removeLayer(this.variableLayer)
            this.variableLayer = null
        }
    }

    updateOpacity(opacity) {
        if (this.variableLayer !== null && this.variableLayer.options.opacity !== opacity) {
            this.variableLayer.setOpacity(opacity)
        }
    }

    render() {
        let {activeVariable, objective, point, region, time, model, opacity} = this.props

        this.updatePointMarker(point)
        this.updateVariableLayer(activeVariable, objective, region, time, model)
        this.updateOpacity(opacity)

        return null
    }
}

MapConnector.propTypes = {
    onOpacityChange: PropTypes.func.isRequired,
    onMapClick: PropTypes.func.isRequired
}

const mapStatetoProps = state => {
    let { runConfiguration, activeVariable, map } = state
    let { opacity } = map
    let { objective, point, region, time, model } = runConfiguration

    return {activeVariable, objective, point, region, time, model, opacity}
}

const mapDispatchToProps = dispatch => {
    return {
        onOpacityChange: opacity => {
            dispatch(setMapOpacity(opacity))
        },
        onMapClick: (lat, lon) => {
            dispatch(setPoint(lat, lon))
        }
    }
}

export default connect(mapStatetoProps, mapDispatchToProps)(MapConnector)
