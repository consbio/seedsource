const defaultState = {
    matched: [],
    elevationAtPoint: null,
    selected: null,
    geometry: null,
    isFetchingZones: false,
    isFetchingGeometry: false
}

export default (state = defaultState, action) => {
    switch(action.type) {
        case 'SELECT_ZONE':
            return Object.assign({}, state, {selected: action.zone, geometry: null, isFetchingGeometry: null})

        case 'REQUEST_ZONES':
            return Object.assign({}, state, {isFetchingZones: true})

        case 'RECEIVE_ZONES':
            let newState =  Object.assign({}, state, {matched: action.zones, isFetchingZones: false})

            if (newState.matched.length) {
                newState.elevationAtPoint = newState.matched[0].elevation_at_point
            }
            else {
                newState.elevationAtPoint = null
            }

            // Clear zone geometry if new set doesn't match selected zone
            if (action.zones.find(item => item.id === state.selected) === undefined) {
                newState = Object.assign(newState, {selected: null, geometry: null, isFetchingGeometry: false})
            }

            if (newState.selected === null && action.zones.length) {
                newState.selected = action.zones[0].id
            }

            return newState

        case 'REQUEST_GEOMETRY':
            return Object.assign({}, state, {isFetchingGeometry: true})

        case 'RECEIVE_GEOMETRY':
            return Object.assign({}, state, {geometry: action.geometry, isFetchingGeometry: false})

        default:
            return state
    }
}
