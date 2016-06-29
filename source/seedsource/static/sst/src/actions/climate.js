export const selectClimateYear = (year) => {
    return {
        type: 'SELECT_CLIMATE_YEAR',
        year
    }
}

export const selectClimateModel = (model) => {
    return {
        type: 'SELECT_CLIMATE_MODEL',
        model
    }
}
