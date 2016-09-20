export const SELECT_UNIT = 'SELECT_UNIT'
export const SELECT_METHOD = 'SELECT_METHOD'
export const SELECT_CENTER = 'SELECT_CENTER'
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

export const selectCenter = center => {
    return {
        type: SELECT_CENTER,
        center
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
    let value = null
    if (json.results.length) {
        value = json.results[0].attributes['Pixel value']
    }

    return {
        type: RECEIVE_VALUE,
        value: value,
        variable,
    }
}

export const requestValue = variable => {
    return {
        type: REQUEST_VALUE,
        variable
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
