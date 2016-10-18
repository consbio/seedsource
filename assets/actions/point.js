export const SET_LATITUDE = 'SET_LATITUDE'
export const SET_LONGITUDE = 'SET_LONGITUDE'
export const SET_POINT = 'SET_POINT'
export const SET_ELEVATION = 'SET_ELEVATION'

export const setLatitude = value => {
    return {
        type: SET_LATITUDE,
        value
    }
}

export const setLongitude = value => {
    return {
        type: SET_LONGITUDE,
        value
    }
}

export const setPoint = (lat, lon) => {
    return {
        type: SET_POINT,
        lat,
        lon
    }
}

export const setElevation = elevation => {
    return {
        type: SET_ELEVATION,
        elevation
    }
}
