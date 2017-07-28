import React, { PropTypes } from 'react'
import ReactTooltip from 'react-tooltip'
import EditableLabel from './EditableLabel'

const Variable = props => {
    let {
        active, name, label, value, zoneCenter, transfer, avgTransfer, transferIsModified, unit, units, method,
        centerValue, onTransferChange, onResetTransfer, onToggle, onRemove
    } = props

    let center
    if (centerValue === null) {
        center = <span className="nodata">--</span>
    }
    else {
        center = <span>{centerValue} {units[unit].label}</span>
    }

    let climaticCenter = null
    if (zoneCenter !== null) {
        climaticCenter = (
            <div>
                <span className="tooltip-label">Zone climatic center:</span>
                <strong>{zoneCenter} {units[unit].label}</strong>
            </div>
        )
    }

    return (
        <tr className={active ? "visible" : ""} data-tip data-for={name + "_Tooltip"}>
            <td>
                <button
                    type="button"
                    className="close"
                    onClick={e => {
                        e.stopPropagation()
                        onRemove()
                    }}
                >
                    <span aria-hidden="true">&times;</span>
                </button>
            </td>
            <td>
                <div className={"modifyStatus " + (transferIsModified ? "modified" : "")}>&nbsp;</div>
                <strong>{name}</strong>
            </td>
            <td>{center}</td>
            <td>
                {transferIsModified && method ?
                    <div className="transferReset" onClick={() => onResetTransfer()}>reset</div> : null
                }
                <EditableLabel value={transfer} onChange={value => onTransferChange(value, unit, units)}>
                    &nbsp;{units[unit].label}
                </EditableLabel>
            </td>
            <td>
                <span
                    className="visibilityToggle icon16 icon-eye"
                    onClick={e => {
                        e.stopPropagation()
                        onToggle()
                    }}
                >
                </span>


                <ReactTooltip id={name + "_Tooltip"} className="variable-tooltip" place="right" effect="solid">
                    <h4>{name}: {label}</h4>
                    <div><span className="tooltip-label">Value at point:</span> <strong>{value}</strong></div>
                    <div>
                        <span className="tooltip-label">Transfer limit (+/-):</span>
                        <strong>{transfer} {units[unit].label} {transferIsModified ? "(modified)" : ""}</strong>
                    </div>
                    <div>
                        <span className="tooltip-label">Avg. transfer limit for zone set:</span>
                        <strong>{avgTransfer} {units[unit].label}</strong>
                    </div>
                    {climaticCenter}
                </ReactTooltip>
            </td>
        </tr>
    )
}

Variable.propTypes = {
    active: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    zoneCenter: PropTypes.string,
    transfer: PropTypes.string.isRequired,
    avgTransfer: PropTypes.string.isRequired,
    transferIsModified: PropTypes.bool.isRequired,
    unit: PropTypes.string.isRequired,
    units: PropTypes.object,
    method: PropTypes.string.isRequired,
    centerValue: PropTypes.string,
    onTransferChange: PropTypes.func.isRequired,
    onResetTransfer: PropTypes.func.isRequired,
    onToggle: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired
}

export default Variable
