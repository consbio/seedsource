/**
 * This component ensures that the Leaflet map state reflects the redux application state, and dispatches map-related
 * events via redux.
 */

import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { topojson } from 'leaflet-omnivore'
import TurfCenter from '@turf/center'
import TurfDistance from '@turf/distance'
import TurfInside from '@turf/inside'
import { setMapOpacity, setBasemap, setZoom, toggleVisibility, setMapCenter } from '../actions/map'
import { setPopupLocation, resetPopupLocation } from '../actions/popup'
import { setPoint } from '../actions/point'
import { getServiceName } from '../utils'
import { variables, timeLabels, regions, regionsBoundariesUrl } from '../config'

class MapConnector extends React.Component {
    constructor(props) {
        super(props)

        this.map = null
        this.regionsBoundaries = null
        this.clickedRegion = null
        this.resultRegion = null
        this.pointMarker = null
        this.variableLayer = null
        this.legend = null
        this.resultsLayer = null
        this.zoneLayer = null
        this.currentZone = null
        this.opacityControl = null
        this.visibilityButton = null
        this.boundaryName = null
        this.popup = null
        this.mapIsMoving = false
    }

    // Initial map setup
    componentWillMount() {
        this.map = L.map('Map', {
            zoom: 4,
            center: [55.0, -112.0],
            minZoom: 3,
            maxZoom: 13
        })

        this.map.on('moveend', event => {
            this.mapIsMoving = false
            setTimeout(function() {
                if (!this.mapIsMoving) {
                    this.props.onMapMove(this.map.getCenter())
                }
            }.bind(this), 1)
        })

        this.map.on('movestart', event => {
            this.mapIsMoving = true;
        })

        this.map.zoomControl.setPosition('topright')

        this.map.addControl(L.control.zoomBox({
            position: 'topright'
        }))

        let geonamesControl = L.control.geonames({
            position: 'topright',
            username: 'seedsource',
            showMarker: false,
            showPopup: false
        })
        geonamesControl.on('select', ({ geoname }) => {
            let latlng = {lat: parseFloat(geoname.lat), lng: parseFloat(geoname.lng)}
            this.map.setView(latlng);
            this.map.fire('click', {latlng})
        })
        this.map.addControl(geonamesControl)

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

        this.map.on('popupclose', () => { this.props.onPopupClose() })

        this.map.on('click', e => {
            if (!e.latlng) {
                return
            }

            this.props.onPopupLocation(e.latlng.lat, e.latlng.lng)

            if (this.clickedRegion) {
                this.removeBoundaryFromMap(this.clickedRegion)
            }

            if (this.props.regionMethod === 'auto') {
                let minDistance = Infinity

                this.regionsBoundaries.eachLayer(layer => {
                    let layerGeoJSON = layer.toGeoJSON()
                    let isInside = TurfInside([e.latlng.lng, e.latlng.lat], layerGeoJSON)
                    let distance = TurfDistance([e.latlng.lng, e.latlng.lat], TurfCenter(layerGeoJSON))

                    if (isInside && distance < minDistance) {
                        this.clickedRegion = layer.feature.properties.region;
                        minDistance = distance
                    }
                })

                if (this.clickedRegion === this.boundaryName) {
                    this.clickedRegion = null
                }
            }
        })

        this.map.on('zoomend', () => {
            this.props.onZoomChange(this.map.getZoom())
        })

        this.regionsBoundaries = topojson(
            regionsBoundariesUrl,
            null,
            L.geoJson(null, {
                style: {
                    fillColor: 'transparent',
                    opacity: 0
                }
            })
        )
        this.map.addLayer(this.regionsBoundaries)
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

    updateVariableLayer(variable, objective, climate, region) {
        if (variable !== null) {
            let layerUrl = '/tiles/' + getServiceName(variable, objective, climate, region) + '/{z}/{x}/{y}.png'

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

            this.addBoundaryToMap(this.props.resultRegion, '#006600')
        }
        else if (this.resultsLayer !== null) {
            this.map.removeLayer(this.resultsLayer)
            this.resultsLayer = null
        }
    }

    addBoundaryToMap(region, color = '#000066') {
        this.regionsBoundaries.setStyle(
            f => f.properties.region === region ? {opacity: 1, fillColor: color, fillOpacity: 0.3, color} : undefined
        )
    }

    removeBoundaryFromMap(region) {
        let style = {opacity: 0, fillColor: 'transparent', fillOpacity: 0}
        if (region) {
            this.regionsBoundaries.setStyle(f => f.properties.region === region ? style : undefined)
        } else {
            this.regionsBoundaries.setStyle(style)
        }
    }

    updateBoundaryLayer(region) {
        if(this.props.regionMethod === 'custom' && this.clickedRegion) {
            this.removeBoundaryFromMap(this.clickedRegion)
            this.clickedRegion = null
        }

        if (region !== null && region !== this.boundaryName) {
            this.boundaryName = region

            // Remove existing layer from viewer
            this.removeBoundaryFromMap()

            let regionObj = regions.find(r => r.name === region)
            this.addBoundaryToMap(regionObj.name)

            if (this.props.resultRegion) {
                this.addBoundaryToMap(this.props.resultRegion, '#006600')
            }
        } else if (region === null) {
            this.boundaryName = null
            this.removeBoundaryFromMap()
        }
    }

    updateOpacity(opacity, serviceId, variable) {
        if (serviceId !== null || variable !== null) {
            if (this.opacityControl === null) {
                this.opacityControl = L.control.opacity()
                this.map.addControl(this.opacityControl)

                this.opacityControl.on('change', e => {
                    this.props.onOpacityChange(e.value / 100)
                })
            }

            this.opacityControl.setValue(Math.round(opacity * 100))
        }
        else if (this.opacityControl !== null) {
            this.map.removeControl(this.opacityControl)
            this.opacityControl = null
        }

        if (this.variableLayer !== null && this.variableLayer.options.opacity !== opacity) {
            this.variableLayer.setOpacity(opacity)
        }

        if (this.resultsLayer !== null && this.resultsLayer.options.opacity !== opacity) {
            this.resultsLayer.setOpacity(opacity)
        }
    }

    updateVisibilityButton(serviceId, showResults) {
        if (serviceId !== null) {
            let icon = showResults ? 'eye-closed' : 'eye';

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
                label: 'Match',
                className: 'results',
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

    updatePopup(popup, unit) {
        let { point, elevation } = popup

        if (point !== null) {
            if (this.clickedRegion) {
                this.addBoundaryToMap(this.clickedRegion, '#aaa')
            }

            if (this.popup === null) {
                let container = L.DomUtil.create('div', 'map-info-popup')

                let location = L.DomUtil.create('div', '', container)

                let elevation = L.DomUtil.create('div', '', container)
                let elevationTitle = L.DomUtil.create('span', '', elevation)
                elevationTitle.innerHTML = 'Elevation: '
                let elevationLabel = L.DomUtil.create('strong', '', elevation)

                let values = L.DomUtil.create('div', '', container)

                L.DomUtil.create('div', '', container).innerHTML = '&nbsp;'

                let button = L.DomUtil.create('button', 'btn btn-sm btn-primary', container)
                button.innerHTML = 'Set Point'

                let popup = L.popup({
                    closeOnClick: false
                }).setLatLng([point.y, point.x]).setContent(container).openOn(this.map)

                L.DomEvent.on(button, 'click', () => {
                    let { point } = this.popup
                    this.map.closePopup(popup)
                    this.props.onMapClick(point.y, point.x)

                    if (this.clickedRegion) {
                        this.removeBoundaryFromMap(this.clickedRegion)
                        this.clickedRegion = null
                    }
                })

                this.popup = {
                    popup,
                    location,
                    elevationLabel,
                    values,
                    point
                }
            }

            if (JSON.stringify(point) !== JSON.stringify(this.popup.point)) {
                this.popup.point = point
            }

            let latlng = this.popup.popup.getLatLng()
            if (latlng.lat !== point.y || latlng.lng !== point.x) {
                this.popup.popup.setLatLng([point.y, point.x])
            }

            let locationLabel = 'Lat: <strong>' + point.y.toFixed(2) +
                '</strong> Lon: <strong>' + point.x.toFixed(2) + '</strong>'
            if (locationLabel !== this.popup.location.innerHTML) {
                this.popup.location.innerHTML = locationLabel
            }

            let elevationLabel = 'N/A'
            if (elevation !== null) {
                elevationLabel = Math.round(elevation / 0.3048) + ' ft (' + Math.round(elevation) + ' m)'
            }
            if (elevationLabel !== this.popup.elevationLabel.innerHTML) {
                this.popup.elevationLabel.innerHTML = elevationLabel
            }

            let valueRows = popup.values.map(item => {
                let variableConfig = variables.find(variable => variable.name === item.name)
                let { multiplier, units } = variableConfig
                let value = 'N/A'
                let unitLabel = units.metric.label

                if (item.value !== null) {
                    value = item.value / multiplier

                    let { precision } = units.metric

                    if (unit === 'imperial') {
                        precision = units.imperial.precision
                        unitLabel = units.imperial.label
                        value = units.imperial.convert(value)
                    }

                    value = value.toFixed(precision)
                }

                return '<div><span>' + item.name + ': </span><strong>' + value + ' ' + unitLabel + '</strong></div>'
            })

            let values = valueRows.join('')

            if (values !== this.popup.values.innerHTML) {
                this.popup.values.innerHTML = values
            }
        }
        else if (this.popup) {
            this.map.closePopup(this.popup.popup)
            this.popup = null
        }
    }

    updateMapCenter(center) {
        let mapCenter = this.map.getCenter()

        if (center[0] != mapCenter.lat || center[1] != mapCenter.lng) {
            this.map.setView(center)
        }
    }

    render() {
        let {
            activeVariable, objective, point, climate, opacity, job, showResults, legends, popup, unit, method, zone,
            geometry, center, region
        } = this.props
        let { serviceId } = job

        this.updatePointMarker(point)
        this.updateVariableLayer(activeVariable, objective, climate, region)
        this.updateResultsLayer(serviceId, showResults)
        this.updateBoundaryLayer(region)
        this.updateOpacity(opacity, serviceId, activeVariable)
        this.updateVisibilityButton(serviceId, showResults)
        this.updateTimeOverlay(activeVariable, objective, climate)
        this.updateLegends(legends, activeVariable, serviceId, unit)
        this.updateZoneLayer(method, zone, geometry)
        this.updatePopup(popup, unit)
        this.updateMapCenter(center)

        return null
    }
}

MapConnector.propTypes = {
    onBasemapChange: PropTypes.func.isRequired,
    onZoomChange: PropTypes.func.isRequired,
    onOpacityChange: PropTypes.func.isRequired,
    onMapClick: PropTypes.func.isRequired,
    onPopupLocation: PropTypes.func.isRequired,
    onPopupClose: PropTypes.func.isRequired,
    onToggleVisibility: PropTypes.func.isRequired,
    onMapMove: PropTypes.func.isRequired
}

const mapStatetoProps = state => {
    let { runConfiguration, activeVariable, map, job, legends, popup, lastRun } = state
    let { opacity, showResults, center } = map
    let { objective, point, climate, unit, method, zones, region, regionMethod } = runConfiguration
    let { geometry } = zones
    let zone = zones.selected
    let resultRegion = lastRun ? lastRun.region : null

    return {
        activeVariable, objective, point, climate, opacity, job, showResults, legends, popup, unit, method, geometry,
        zone, center, region, regionMethod, resultRegion
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

        onPopupLocation: (lat, lon) => {
            dispatch(setPopupLocation(lat, lon))
        },

        onPopupClose: () => {
            // Dispatching this event immediately causes state warnings
            setTimeout(() => dispatch(resetPopupLocation()), 1)
        },

        onToggleVisibility: () => {
            dispatch(toggleVisibility())
        },

        onMapMove: center => {
            dispatch(setMapCenter([center.lat, center.lng]))
        }
    }
}

export default connect(mapStatetoProps, mapDispatchToProps)(MapConnector)
