export const setLatitude = (value) => {
    return {
        type: 'SET_LATITUDE',
        value
    }
}

export const setLongitude = (value) => {
    return {
        type: 'SET_LONGITUDE',
        value
    }
}

export const setPoint = (lat, lon) => {
    return {
        type: 'SET_POINT',
        lat,
        lon
    }
}
