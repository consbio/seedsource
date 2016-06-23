export const addVariable = (variable) => {
    return {
        type: 'ADD_VARIABLE',
        variable
    }
}

export const removeVariable = (index) => {
    return {
        type: 'REMOVE_VARIABLE',
        index
    }
}

export const modifyVariable = (index, transfer) => {
    return {
        type: 'MODIFY_VARIABLE',
        index,
        transfer
    }
}
