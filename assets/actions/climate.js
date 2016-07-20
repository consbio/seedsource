export const selectClimateYear = (year, climate) => {
    return {
        type: 'SELECT_CLIMATE_YEAR',
        year,
        climate
    }
}

export const selectClimateModel = (model, climate) => {
    return {
        type: 'SELECT_CLIMATE_MODEL',
        model,
        climate
    }
}
