import { combineReducers } from 'redux'
import auth from './auth'
import runConfiguration from './runConfiguration'
import tabs from './tabs'
import { activeVariable } from './variables'

export default combineReducers({
    isLoggedIn: auth,
    activeTab: tabs,
    activeVariable,
    runConfiguration,
})
