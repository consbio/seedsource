const defaultState = {
    opacity: 1,
    basemap: '//{s}.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    zoom: 5,
    showResults: true
}

export default (state=defaultState, action) => {
    switch (action.type) {
        case 'SET_MAP_OPACITY':
            return Object.assign({}, state, {opacity: action.opacity})

        case 'SET_BASEMAP':
            return Object.assign({}, state, {basemap: action.basemap})

        case 'SET_ZOOM':
            return Object.assign({}, state, {zoom: action.zoom})

        case 'TOGGLE_VISIBILITY':
            return Object.assign({}, state, {showResults: !state.showResults})

        case 'FINISH_JOB':
            return Object.assign({}, state, {showResults: true})

        default:
            return state
    }
}
