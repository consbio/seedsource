import { connect } from 'react-redux'
import { modifyVariable, toggleVariable } from '../actions/variables'
import Variable from '../componenets/Variable'
import { species } from '../config'

const mapStateToProps = (state, { variable, index }) => {
    let active = state.activeVariable === variable.name
    let { name, label, value, transfer } = variable

    if (value === null) {
        value = 'N/A'
    }

    if (transfer === null) {
        let activeSpecies = species.find(item => item.name === state.runConfiguration.species)

        if (activeSpecies.transfers.hasOwnProperty(name)) {
            transfer = activeSpecies.transfers[name]
        }
        else {
            transfer = 0
        }
    }

    return {active, index, name, label, value, transfer}
}

const mapDispatchToProps = (dispatch, { variable, index }) => {
    return {
        onTransferBlur: transfer => {
            let value = parseFloat(transfer)

            if (!isNaN(value)) {
                dispatch(modifyVariable(index, value))
            }
        },

        onClick: () => {
            dispatch(toggleVariable(variable.name))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Variable)
