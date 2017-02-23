import 'babel-polyfill'
import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, applyMiddleware } from 'redux'
import thunkMiddleware from 'redux-thunk'
import reducers from './reducers'
import App from './componenets/App'
import variables from './async/variables'
import zones from './async/zones'
import legends from './async/legends'
import point from './async/point'
import popup from './async/popup'
import region from './async/region'

export const store = createStore(reducers, applyMiddleware(thunkMiddleware));

SST.reduxStore = store

render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('Sidebar')
)

// Register resync handlers
variables(store)
zones(store)
legends(store)
point(store)
popup(store)
//region(store)