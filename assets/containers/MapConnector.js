/**
 * This component ensures that the Leaflet map state reflects the redux application state, and dispatches map-related
 * events via redux.
 */

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { setMapOpacity, setBasemap, setZoom, toggleVisibility } from '../actions/map'
import { setPoint } from '../actions/point'
import { getServiceName } from '../utils'
import { fetchVariableLegend, fetchResultsLegend } from '../actions/legends'
import { fetchGeometry } from '../actions/zones'
import { variables } from '../config'

const timeLabels = {
    '1961_1990': '1961 - 1990',
    '1981_2010': '1981 - 2010',
    '2025rcp45': '2025 RCP 4.5',
    '2025rcp85': '2025 RCP 8.5',
    '2055rcp45': '2055 RCP 4.5',
    '2055rcp85': '2055 RCP 8.5',
    '2085rcp45': '2085 RCP 4.5',
    '2085rcp85': '2085 RCP 8.5'
}

class MapConnector extends React.Component {
    constructor(props) {
        super(props)
        this.map = null
        this.pointMarker = null
        this.variableLayer = null
        this.legend = null
        this.resultsLayer = null
        this.zoneLayer = null
        this.currentZone = null
        this.visibilityButton = null
    }

    // Initial map setup
    componentWillMount() {
        this.map = L.map('Map', {
            zoom: 5,
            center: [44.68, -109.36],
            minZoom: 5,
            maxZoom: 13
        })

        this.map.zoomControl.setPosition('topright')

        this.map.addControl(L.control.zoomBox({position: 'topright'}))

        let basemapControl = L.control.basemaps({
            basemaps: [
                L.tileLayer('//{s}.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
                    maxZoom: 16,
                    subdomains: ['server', 'services']
                }),
                L.tileLayer('//{s}.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
                    maxZoom: 16,
                    subdomains: ['server', 'services']
                }),
                L.tileLayer('//{s}.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}', {
	                attribution: 'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS',
	                maxZoom: 13,
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
        })
        this.map.addControl(basemapControl)

        this.map.on('baselayerchange', layer => {
            this.props.onBasemapChange(layer._url)
        })

        let opacityControl = L.control.opacity()
        this.map.addControl(opacityControl)

        opacityControl.on('change', e => {
            this.props.onOpacityChange(e.value / 100)
        })

        this.map.on('click', e => {
            this.props.onMapClick(e.latlng.lat, e.latlng.lng)
        })

        this.map.on('zoomend', () => {
            this.props.onZoomChange(this.map.getZoom())
        })
    }

    componentWillUpdate({ activeVariable, job, legends, zone, geometry }) {
        if (activeVariable !== this.props.activeVariable) {
            this.props.onFetchVariableLegend()
        }

        if (job.serviceId && legends.results.legend === null) {
            this.props.onFetchResultsLegend()
        }
        
        if (zone !== null && geometry === null) {
            this.props.onFetchZoneGeometry()
        }
    }

    updatePointMarker(point) {
        let pointIsValid = point !== null && point.x && point.y

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

    updateVariableLayer(variable, objective, climate) {
        if (variable !== null) {
            let layerUrl = '/tiles/' + getServiceName(variable, objective, climate) + '/{z}/{x}/{y}.png'

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

    updateResultsLayer(serviceId, showResults) {
        if (serviceId !== null && showResults) {
            let layerUrl = '/tiles/' + serviceId + '/{z}/{x}/{y}.png'

            if (this.resultsLayer === null) {
                this.resultsLayer = L.tileLayer(layerUrl, {zIndex: 2, opacity: 1}).addTo(this.map)
            }
            else if (layerUrl !== this.resultsLayer._url) {
                this.resultsLayer.setUrl(layerUrl)
            }
        }
        else if (this.resultsLayer !== null) {
            this.map.removeLayer(this.resultsLayer)
            this.resultsLayer = null
        }
    }

    updateOpacity(opacity) {
        if (this.variableLayer !== null && this.variableLayer.options.opacity !== opacity) {
            this.variableLayer.setOpacity(opacity)
        }

        if (this.resultsLayer !== null && this.resultsLayer.options.opacity !== opacity) {
            this.resultsLayer.setOpacity(opacity)
        }
    }

    updateVisibilityButton(serviceId, showResults) {
        if (serviceId !== null) {
            let icon = showResults ? 'eye-close' : 'eye-open';

            if (this.visibilityButton === null) {
                this.visibilityButton = L.control.button({'icon': icon})
                this.visibilityButton.on('click', e => {
                    this.props.onToggleVisibility()
                })
                this.map.addControl(this.visibilityButton)
            }
            else if (this.visibilityButton.options.icon !== icon) {
                this.visibilityButton.setIcon(icon)
            }
        }
        else if (this.visibilityButton !== null) {
            this.map.removeControl(this.visibilityButton)
            this.visibilityButton = null
        }
    }

    updateTimeOverlay(variable, objective, climate) {
        let overlayNode = document.getElementById('TimeOverlay')

        if (variable === null) {
            if (!overlayNode.classList.contains('hidden')) {
                overlayNode.classList.add('hidden')
            }
        }
        else {
            if (overlayNode.classList.contains('hidden')) {
                overlayNode.classList.remove('hidden')
            }

            let selectedClimate = objective === 'seedlots' ? climate.site : climate.seedlot
            let { time, model } = selectedClimate
            let labelKey = time

            if (time !== '1961_1990' && time !== '1981_2010') {
                labelKey += model
            }

            let label = timeLabels[labelKey]
            let labelNode = document.getElementById('TimeLabel')

            if (labelNode.innerHTML !== label) {
                labelNode.innerHTML = label
            }
        }
    }
    
    updateLegends(legends, activeVariable, serviceId, unit) {
        let mapLegends = []

        if (serviceId !== null && legends.results.legend !== null) {
            mapLegends.push({
                label: 'Results',
                elements: legends.results.legend
            })
        }

        if (activeVariable !== null && legends.variable.legend !== null) {
            let variable = variables.find(item => item.name === activeVariable)
            let { units, multiplier } = variable
            let legend = legends.variable.legend.map(item => {
                let value = parseFloat(item.label)

                if (!isNaN(value)) {
                    value /= multiplier

                    if (units !== null && unit == 'imperial') {
                        value = units.imperial.convert(value)
                    }

                    value = parseFloat(value.toFixed(2)) + ' ' + units[unit].label

                    return Object.assign({}, item, {label: value})
                }

                return item
            })

            mapLegends.push({
                label: activeVariable,
                elements: legend
            })
        }

        if (mapLegends.length) {
            if (this.legend === null) {
                this.legend = L.control.legend({legends: mapLegends})
                this.map.addControl(this.legend)
            }
            else if (JSON.stringify(mapLegends) !== JSON.stringify(this.legend.options.legends)) {
                this.legend.setLegends(mapLegends)
            }
        }
        else if (this.legend !== null) {
            this.map.removeControl(this.legend)
            this.legend = null
        }
    }

    updateZoneLayer(method, zone, geometry) {
        if (method === 'seedzone' && geometry !== null) {
            if (zone !== this.currentZone && this.zoneLayer !== null) {
                this.map.removeLayer(this.zoneLayer)
                this.zoneLayer = null
            }

            if (this.zoneLayer === null) {
                this.zoneLayer = L.geoJson(geometry, {style: () => {
                    return {color: '#0F0', fill: false}
                }}).addTo(this.map)
            }

            this.currentZone = zone
        }
        else if (this.zoneLayer !== null) {
            this.map.removeLayer(this.zoneLayer)
            this.zoneLayer = null
            this.currentZone = null
        }
    }

    render() {
        let {
            activeVariable, objective, point, climate, opacity, job, showResults, legends, unit, method, zone,
            geometry
        } = this.props

        this.updatePointMarker(point)
        this.updateVariableLayer(activeVariable, objective, climate)
        this.updateResultsLayer(job.serviceId, showResults)
        this.updateOpacity(opacity)
        this.updateVisibilityButton(job.serviceId, showResults)
        this.updateTimeOverlay(activeVariable, objective, climate)
        this.updateLegends(legends, activeVariable, job.serviceId, unit)
        this.updateZoneLayer(method, zone, geometry)

        return null
    }
}

MapConnector.propTypes = {
    onBasemapChange: PropTypes.func.isRequired,
    onZoomChange: PropTypes.func.isRequired,
    onOpacityChange: PropTypes.func.isRequired,
    onMapClick: PropTypes.func.isRequired,
    onToggleVisibility: PropTypes.func.isRequired,
    onFetchVariableLegend: PropTypes.func.isRequired,
    onFetchResultsLegend: PropTypes.func.isRequired
}

const mapStatetoProps = state => {
    let { runConfiguration, activeVariable, map, job, legends } = state
    let { opacity, showResults } = map
    let { objective, point, region, climate, unit, method, zones } = runConfiguration
    let { geometry } = zones
    let zone = zones.selected

    return {
        activeVariable, objective, point, region, climate, opacity, job, showResults, legends, unit, method, geometry,
        zone
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onBasemapChange: basemap => {
            dispatch(setBasemap(basemap))
        },

        onZoomChange: zoom => {
            dispatch(setZoom(zoom))
        },

        onOpacityChange: opacity => {
            dispatch(setMapOpacity(opacity))
        },

        onMapClick: (lat, lon) => {
            dispatch(setPoint(lat, lon))
        },

        onToggleVisibility: () => {
            dispatch(toggleVisibility())
        },

        onFetchVariableLegend: () => {
            dispatch(fetchVariableLegend())
        },

        onFetchResultsLegend: () => {
            dispatch(fetchResultsLegend())
        },

        onFetchZoneGeometry: () => {
            dispatch(fetchGeometry())
        }
    }
}

export default connect(mapStatetoProps, mapDispatchToProps)(MapConnector)
