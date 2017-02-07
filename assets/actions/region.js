export const SELECT_REGION_METHOD = 'SELECT_REGION_METHOD'
export const SELECT_REGION = 'SELECT_REGION'
export const REQUEST_REGION = 'REQUEST_REGION'
export const RECEIVE_REGION = 'RECEIVE_REGION'
export const FAIL_REGION = 'FAIL_REGION'

export const selectRegionMethod = method => {
    return {
        type: SELECT_REGION_METHOD,
        method
    }
}

export const selectRegion = region => {
    return {
        type: SELECT_REGION,
        region
    }
}

export const requestRegion = () => {
    return {
        type: REQUEST_REGION
    }
}

export const receiveRegion = region => {
    return {
        type: RECEIVE_REGION,
        region
    }
}

export const failRegion = () => {
    return {
        type: FAIL_REGION
    }
}