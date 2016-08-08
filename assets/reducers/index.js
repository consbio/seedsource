import { combineReducers } from 'redux'
import auth from './auth'
import runConfiguration, { lastRun, activeStep, pdfIsFetching } from './runConfiguration'
import tabs from './tabs'
import { activeVariable } from './variables'
import map from './map'
import job from './job'
import saves from './saves'
import legends from './legends'
import error from './error'

export default combineReducers({
    isLoggedIn: auth,
    activeTab: tabs,
    activeVariable,
    activeStep,
    runConfiguration,
    lastRun,
    map,
    job,
    saves,
    legends,
    pdfIsFetching,
    error
})
