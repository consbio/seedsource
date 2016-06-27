import { combineReducers } from 'redux'
import auth from './auth'
import runConfiguration from './runConfiguration'
import tabs from './tabs'
import { activeVariable } from './variables'
import map from './map'

export default combineReducers({
    isLoggedIn: auth,
    activeTab: tabs,
    activeVariable,
    runConfiguration,
    map
})
