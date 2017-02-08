import point, { defaultState as defaultPoint } from './point'
import variables from './variables'
import zones from './zones'
import climate from './climate'
import { SELECT_OBJECTIVE } from '../actions/objectives'
import { SET_LATITUDE, SET_LONGITUDE, SET_POINT, SET_ELEVATION } from '../actions/point'
import { SELECT_SPECIES } from '../actions/species'
import { SELECT_UNIT, SELECT_METHOD, SELECT_CENTER } from '../actions/variables'
import { LOAD_CONFIGURATION, RESET_CONFIGURATION } from '../actions/saves'
import { FINISH_JOB } from '../actions/job'
import { SELECT_STEP } from '../actions/step'
import { REQUEST_PDF, RECEIVE_PDF, FAIL_PDF } from '../actions/pdf'
import { SELECT_REGION_METHOD, SELECT_REGION } from '../actions/region'
import { morph } from '../utils'

const defaultConfiguration = {
    objective: 'seedlots',
    species: 'generic',
    point: defaultPoint,
    region: 'west2',
    climate: null,
    method: 'custom',
    center: 'point',
    unit: 'metric',
    zones: null,
    regionMethod: 'auto',
    variables: []
}

export default (state = defaultConfiguration, action) => {
    let runConfiguration = () => {
        switch(action.type) {
            case SELECT_OBJECTIVE:
                return morph(state, {objective: action.objective})

            case SET_LATITUDE:
            case SET_LONGITUDE:
            case SET_POINT:
            case SET_ELEVATION:
                state = morph(state, {point: point(state.point, action)})

                if (action.type !== SET_ELEVATION && state.regionMethod === 'auto') {
                    //state.region = findClosestRegion(state.point.x, state.point.y).name
                }

                return state

            case SELECT_SPECIES:
                return morph(state, {species: action.species})

            case SELECT_UNIT:
                return morph(state, {unit: action.unit})

            case SELECT_METHOD:
                return morph(state, {method: action.method})

            case SELECT_CENTER:
                return morph(state, {center: action.center})

            case SELECT_REGION_METHOD:
                state = morph(state, {regionMethod: action.method})

                if (action.method === 'auto') {
                //    state.region = findClosestRegion(state.point.x, state.point.y).name
                }

                return state

            case SELECT_REGION:
                return morph(state, {region: action.region})

            case RESET_CONFIGURATION:
                return defaultConfiguration

            case LOAD_CONFIGURATION:
                return morph(defaultConfiguration, action.configuration)

            default:
                return state
        }
    }

    state = runConfiguration()

    return morph(state, {
        variables: variables(state.variables, action),
        zones: zones(state.zones || undefined, action),
        climate: climate(state.climate || undefined, action)
    })
}

export const lastRun = (state = null, action) => {
    switch (action.type) {
        case FINISH_JOB:
            return action.configuration

        case LOAD_CONFIGURATION:
            return null

        default:
            return state
    }
}

export const activeStep = (state = 'objective', action) => {
    switch (action.type) {
        case SELECT_STEP:
            return action.step

        default:
            return state
    }
}

export const pdfIsFetching = (state = false, action) => {
    switch (action.type) {
        case REQUEST_PDF:
            return true

        case RECEIVE_PDF:
        case FAIL_PDF:
            return false

        default:
            return state
    }
}
