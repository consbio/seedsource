import { connect } from 'react-redux'
import { modifyVariable, toggleVariable, removeVariable, fetchValue } from '../actions/variables'
import Variable from '../componenets/Variable'
import { species } from '../config'

const mapStateToProps = (state, { variable, index }) => {
    let active = state.activeVariable === variable.name
    let { name, label, value, transfer, multiplier, isTemperature } = variable

    if (transfer === null) {
        let activeSpecies = species.find(item => item.name === state.runConfiguration.species)

        if (activeSpecies.transfers.hasOwnProperty(name)) {
            transfer = activeSpecies.transfers[name]
        }
        else {
            transfer = 0
        }
    }

    transfer /= multiplier

    if (value !== null) {
        value /= multiplier
    }

    return {active, index, name, label, value, transfer}
}

const mapDispatchToProps = (dispatch, { variable, index }) => {
    return {
        onTransferBlur: transfer => {
            let value = parseFloat(transfer)

            if (!isNaN(value)) {
                dispatch(modifyVariable(index, value * variable.multiplier))
            }
        },

        onClick: () => {
            dispatch(toggleVariable(variable.name))
        },

        onRemove: () => {
            dispatch(removeVariable(variable.name, index))
        },

        onRequestValue: () => {
            dispatch(fetchValue(variable.name))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Variable)
