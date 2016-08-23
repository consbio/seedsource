import { connect } from 'react-redux'
import { modifyVariable, resetTransfer, toggleVariable, removeVariable } from '../actions/variables'
import Variable from '../componenets/Variable'
import { get, urlEncode } from '../io'
import { variables } from '../config'

const mapStateToProps = (state, { variable, index }) => {
    let { activeVariable, runConfiguration } = state
    let active = activeVariable === variable.name
    let { unit, method, center, point, zones, climate } = runConfiguration
    let variableConfig = variables.find(item => item.name === variable.name)
    let { name, value, zoneCenter, transfer, avgTransfer, transferIsModified } = variable
    let { label, multiplier, units } = variableConfig

    transferIsModified = transferIsModified && method === 'seedzone'

    let convert = number => {
        if (number !== null) {
            number /= multiplier

            let { precision } = units.metric

            if (unit === 'imperial') {
                precision = units.imperial.precision
                number = units.imperial.convert(number)
            }

            return parseFloat(number.toFixed(precision))
        }

        return number
    }

    let convertTransfer = number => {
        if (number === null) {
            number = 0
        }

        number /= multiplier

        let { transferPrecision } = units.metric

        if (unit === 'imperial') {
            let { convertTransfer, convert } = units.imperial
            transferPrecision = units.imperial.transferPrecision

            if (convertTransfer) {
                return parseFloat(convertTransfer(number).toFixed(transferPrecision))
            }
            else if (convert !== null) {
                return parseFloat(convert(number).toFixed(transferPrecision))
            }
        }

        return parseFloat(number.toFixed(transferPrecision))
    }

    transfer = convertTransfer(transfer)
    avgTransfer = convertTransfer(avgTransfer)
    value = convert(value)
    zoneCenter = convert(zoneCenter)

    let centerValue = method === 'seedzone' && center === 'zone' ? zoneCenter : value

    return {
        zone: zones.selected,
        active,
        index,
        name,
        label,
        value,
        zoneCenter,
        transfer,
        avgTransfer,
        transferIsModified,
        unit,
        units,
        method,
        point,
        climate,
        centerValue
    }
}

const mapDispatchToProps = (dispatch, { variable, index }) => {
    return {
        onTransferChange: (transfer, unit, units) => {
            let value = parseFloat(transfer)

            if (!isNaN(value)) {
                if (unit === 'imperial' && units !== null) {
                    if (units.metric.convertTransfer) {
                        value = units.metric.convertTransfer(value)
                    }
                    else if (units.metric.convert !== null) {
                        value = units.metric.convert(value)
                    }
                }

                let variableConfig = variables.find(item => item.name === variable.name)

                dispatch(modifyVariable(variable.name, value * variableConfig.multiplier))
            }
        },

        onResetTransfer: () => {
            dispatch(resetTransfer(variable.name))
        },

        onToggle: () => {
            dispatch(toggleVariable(variable.name))
        },

        onRemove: () => {
            dispatch(removeVariable(variable.name, index))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Variable)
