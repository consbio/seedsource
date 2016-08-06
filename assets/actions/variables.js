import fetch from 'isomorphic-fetch'
import { getServiceName } from '../utils'

export const SELECT_UNIT = 'SELECT_UNIT'
export const SELECT_METHOD = 'SELECT_METHOD'
export const SELECT_SEEDZONE = 'SELECT_SEEDZONE'
export const ADD_VARIABLE = 'ADD_VARIABLE'
export const REMOVE_VARIABLE = 'REMOVE_VARIABLE'
export const MODIFY_VARIABLE = 'MODIFY_VARIABLE'
export const RESET_TRANSFER = 'RESET_TRANSFER'
export const TOGGLE_VARIABLE = 'TOGGLE_VARIABLE'
export const RECEIVE_VALUE = 'RECEIVE_VALUE'
export const REQUEST_VALUE = 'REQUEST_VALUE'
export const RECEIVE_TRANSFER = 'RECEIVE_TRANSFER'
export const REQUEST_TRANSFER = 'REQUEST_TRANSFER'

export const selectUnit = unit => {
    return {
        type: SELECT_UNIT,
        unit
    }
}

export const selectMethod = method => {
    return {
        type: SELECT_METHOD,
        method
    }
}

export const selectSeedzone = seedzone => {
    return {
        type: SELECT_SEEDZONE,
        seedzone
    }
}

export const addVariable = variable => {
    return {
        type: ADD_VARIABLE,
        variable
    }
}

export const removeVariable = (variable, index) => {
    return {
        type: REMOVE_VARIABLE,
        variable,
        index
    }
}

export const modifyVariable = (variable, transfer) => {
    return {
        type: MODIFY_VARIABLE,
        variable,
        transfer
    }
}

export const resetTransfer = variable => {
    return {
        type: RESET_TRANSFER,
        variable
    }
}

export const toggleVariable = variable => {
    return {
        type: TOGGLE_VARIABLE,
        variable
    }
}

export const receiveValue = (variable, json) => {
    return {
        type: RECEIVE_VALUE,
        value: json.results[0].attributes['Pixel value'],
        variable,
    }
}

export const requestValue = variable => {
    return {
        type: REQUEST_VALUE,
        variable
    }
}

export const fetchValue = name => {
    return (dispatch, getState) => {
        let {runConfiguration} = getState()
        let {objective, point, climate, variables} = runConfiguration
        let variable = variables.find(item => item.name === name)
        let pointIsValid = point !== null && point.x && point.y

        if (variable !== undefined && variable.value === null && !variable.isFetching && pointIsValid) {
            dispatch(requestValue(name))

            let url = '/arcgis/rest/services/' + getServiceName(name, objective, climate) +
                '/MapServer/identify/' + '?f=json&tolerance=2&imageDisplay=1600%2C1031%2C96&&' +
                'geometryType=esriGeometryPoint&' +
                'mapExtent=-12301562.058352625%2C6293904.1727356175%2C-12056963.567839967%2C6451517.325059711' +
                '&geometry=' + JSON.stringify(point)

            return fetch(url, {credentials: 'same-origin'})
                .then(response => response.json())
                .then(json => dispatch(receiveValue(name, json)))
        }

        return Promise.resolve()
    }
}

export const receiveTransfer = (variable, transfer, avgTransfer, center) => {
    return {
        type: RECEIVE_TRANSFER,
        transfer,
        avgTransfer,
        center,
        variable
    }
}

export const requestTransfer = variable => {
    return {
        type: REQUEST_TRANSFER,
        variable
    }
}
