import { connect } from 'react-redux'
import {
    modifyVariable, resetTransfer, toggleVariable, removeVariable, fetchValue, requestTransfer, receiveTransfer
} from '../actions/variables'
import Variable from '../componenets/Variable'
import { get, urlEncode } from '../io'
import { variables } from '../config'

const mapStateToProps = (state, { variable, index }) => {
    let { activeVariable, runConfiguration } = state
    let active = activeVariable === variable.name
    let { unit, method, point, zones, climate } = runConfiguration
    let variableConfig = variables.find(item => item.name === variable.name)
    let { name, value, zoneCenter, transfer, avgTransfer, transferIsModified } = variable
    let { label, multiplier, units } = variableConfig

    let convert = number => {
        if (number !== null) {
            number /= multiplier

            if (unit === 'imperial') {
                number = units.imperial.convert(number)
            }

            return parseFloat(number.toFixed(2))
        }

        return number
    }

    let convertTransfer = number => {
        if (number === null) {
            number = 0
        }

        number /= multiplier

        if (unit === 'imperial') {
            let { convertTransfer, convert } = units.imperial

            if (convertTransfer) {
                return parseFloat(convertTransfer(number).toFixed(2))
            }
            else if (convert !== null) {
                return parseFloat(convert(number).toFixed(2))
            }
        }

        return parseFloat(number.toFixed(2))
    }

    transfer = convertTransfer(transfer)
    avgTransfer = convertTransfer(avgTransfer)
    value = convert(value)
    zoneCenter = convert(zoneCenter)

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
        climate
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
        },

        onRequestValue: () => {
            dispatch(fetchValue(variable.name))
        },

        fetchTransfer: (method, point, zone, year) => {
            dispatch(requestTransfer(variable.name))

            let pointIsValid = point !== null && point.x && point.y

            if (method === 'seedzone' && pointIsValid) {
                let url = '/sst/transfer-limits/?' + urlEncode({
                    point: point.x + ',' + point.y,
                    variable: variable.name,
                    zone_id: zone,
                    time_period: year
                })

                return get(url).then(response => response.json()).then(json => {
                    if (json.results.length) {
                        let { transfer, avg_transfer, center } = json.results[0]
                        return {transfer, center, avgTransfer: avg_transfer}
                    }
                    else {
                        return null
                    }
                })
            }

            return null
        },
        
        receiveTransfer: result => {
            let { transfer, avgTransfer, center } = result
            dispatch(receiveTransfer(variable.name, transfer, avgTransfer, center))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Variable)
