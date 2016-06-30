import { connect } from 'react-redux'
import { modifyVariable, toggleVariable, removeVariable, fetchValue } from '../actions/variables'
import Variable from '../componenets/Variable'
import { species } from '../config'

const toF = value => value * 1.8 + 32  // Convert to fahrenheit

const mapStateToProps = (state, { variable, index }) => {
    let { activeVariable, runConfiguration } = state
    let active = activeVariable === variable.name
    let { unit } = runConfiguration
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

    if (isTemperature && unit === 'f') {
        transfer *= 1.8
    }

    transfer = parseFloat(transfer.toFixed(2))

    if (value !== null) {
        value /= multiplier

        if (isTemperature && unit === 'f') {
            value = toF(value)
        }

        value = parseFloat(value.toFixed(2))
    }

    return {active, index, name, label, value, transfer, unit, isTemperature}
}

const mapDispatchToProps = (dispatch, { variable, index }) => {
    return {
        onTransferBlur: (transfer, unit, isTemperature) => {
            let value = parseFloat(transfer)

            if (!isNaN(value)) {
                if (isTemperature && unit === 'f') {
                    value /= 1.8
                }

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
