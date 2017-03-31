export const SET_MAP_OPACITY = 'SET_MAP_OPACITY'
export const SET_BASEMAP = 'SET_BASEMAP'
export const SET_ZOOM = 'SET_ZOOM'
export const TOGGLE_VISIBILITY = 'TOGGLE_VISIBILITY'
export const SET_MAP_CENTER = 'SET_MAP_POINT'

export const setMapOpacity = opacity => {
    return {
        type: SET_MAP_OPACITY,
        opacity
    }
}

export const setBasemap = basemap => {
    return {
        type: SET_BASEMAP,
        basemap
    }
}

export const setZoom = zoom => {
    return {
        type: SET_ZOOM,
        zoom
    }
}

export const toggleVisibility = () => {
    return {
        type: TOGGLE_VISIBILITY
    }
}

export const setMapCenter = center => {
    return {
        type: SET_MAP_CENTER,
        center
    }
}
