export const SELECT_REGION_METHOD = 'SELECT_REGION_METHOD'
export const SELECT_REGION = 'SELECT_REGION'
export const SELECT_NO_REGION = 'SELECT_NO_REGION'
export const REQUEST_REGIONS = 'REQUEST_REGIONS'
export const RECEIVE_REGIONS = 'RECEIVE_REGIONS'
export const FAIL_REGIONS = 'FAIL_REGIONS'

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

export const selectNoRegion = () => {
    return {
        type: SELECT_NO_REGION
    }
}

export const requestRegions = () => {
    return {
        type: REQUEST_REGIONS
    }
}

export const receiveRegions = regions => {
    return {
        type: RECEIVE_REGIONS,
        regions
    }
}

export const failRegions = () => {
    return {
        type: FAIL_REGIONS
    }
}