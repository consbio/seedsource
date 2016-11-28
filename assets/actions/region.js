export const SELECT_REGION_METHOD = 'SELECT_REGION_METHOD'
export const SELECT_REGION = 'SELECT_REGION'

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
