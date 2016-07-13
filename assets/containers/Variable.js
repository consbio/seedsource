import { connect } from 'react-redux'
import { modifyVariable, toggleVariable, removeVariable, fetchValue } from '../actions/variables'
import Variable from '../componenets/Variable'
import { species } from '../config'

const mapStateToProps = (state, { variable, index }) => {
    let { activeVariable, runConfiguration } = state
    let active = activeVariable === variable.name
    let { unit } = runConfiguration
    let { name, label, value, transfer, multiplier, units } = variable

    if (transfer === null) {
        let activeSpecies = species.find(item => item.name === state.runConfiguration.species)

        if (activeSpecies !== undefined && activeSpecies.transfers.hasOwnProperty(name)) {
            transfer = activeSpecies.transfers[name]
        }
        else {
            transfer = 0
        }
    }

    transfer /= multiplier

    if (unit === 'imperial' && units !== null) {
        if (units.imperial.convertTransfer) {
            transfer = units.imperial.convertTransfer(transfer)
        }
        else {
            transfer = units.imperial.convert(transfer)
        }
    }

    transfer = parseFloat(transfer.toFixed(2))

    if (value !== null) {
        value /= multiplier

        if (unit === 'imperial' && units !== null) {
            value = units.imperial.convert(value)
        }

        value = parseFloat(value.toFixed(2))
    }

    return { active, index, name, label, value, transfer, unit, units }
}

const mapDispatchToProps = (dispatch, { variable, index }) => {
    return {
        onTransferBlur: (transfer, unit, units) => {
            let value = parseFloat(transfer)

            if (!isNaN(value)) {
                if (unit === 'imperial' && units !== null) {
                    if (units.metric.convertTransfer) {
                        value = units.metric.convertTransfer(value)
                    }
                    else {
                        value = units.metric.convert(value)
                    }
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
