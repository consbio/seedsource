export const SET_POPUP_LOCATION = 'SET_POPUP_LOCATION'
export const RESET_POPUP_LOCATION = 'RESET_POPUP_LOCATION'
export const REQUEST_POPUP_VALUE = 'REQUEST_POPUP_VALUE'
export const RECEIVE_POPUP_VALUE = 'RECEIVE_POPUP_VALUE'
export const RECEIVE_POPUP_ELEVATION = 'RECEIVE_POPUP_ELEVATION'
export const REQUEST_POPUP_REGION = 'REQUEST_POPUP_REGION'
export const RECEIVE_POPUP_REGION = 'RECEIVE_POPUP_REGION'

export const setPopupLocation = (lat, lon) => {
    return {
        type: SET_POPUP_LOCATION,
        lat,
        lon
    }
}

export const resetPopupLocation = () => {
    return {
        type: RESET_POPUP_LOCATION
    }
}

export const requestPopupValue = variable => {
    return {
        type: REQUEST_POPUP_VALUE,
        variable
    }
}

export const receivePopupValue = (variable, json) => {
    let value = null
    if (json.results.length) {
        value = json.results[0].attributes['Pixel value']
    }

    return {
        type: RECEIVE_POPUP_VALUE,
        value: value,
        variable
    }
}

export const receivePopupElevation = elevation => {
    return {
        type: RECEIVE_POPUP_ELEVATION,
        elevation
    }
}

export const requestPopupRegion = () => {
    return {
        type: REQUEST_POPUP_REGION
    }
}

export const receivePopupRegion = region => {
    return {
        type: RECEIVE_POPUP_REGION,
        region
    }
}
