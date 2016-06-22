import { combineReducers } from 'redux'
import auth from './auth'
import runConfiguration from './runConfiguration'
import tabs from './tabs'

export default combineReducers({
    isLoggedIn: auth,
    activeTab: tabs,
    runConfiguration,
})
