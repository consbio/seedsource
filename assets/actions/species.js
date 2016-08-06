export const SELECT_SPECIES = 'SELECT_SPECIES'

export const selectSpecies = (species) => {
    return {
        type: SELECT_SPECIES,
        species
    }
}
