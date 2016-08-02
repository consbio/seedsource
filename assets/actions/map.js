export const setMapOpacity = opacity => {
    return {
        type: 'SET_MAP_OPACITY',
        opacity
    }
}

export const setBasemap = basemap => {
    return {
        type: 'SET_BASEMAP',
        basemap
    }
}

export const setZoom = zoom => {
    return {
        type: 'SET_ZOOM',
        zoom
    }
}

export const toggleVisibility = () => {
    return {
        type: 'TOGGLE_VISIBILITY'
    }
}
