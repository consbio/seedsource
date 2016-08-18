import React from 'react'
import ReactDOM from 'react-dom'
import { PropTypes } from 'react'
import ReactTooltip from 'react-tooltip'
import Synchro from '../containers/Synchro'

class Variable extends React.Component {
    constructor(props) {
        super(props)
        this.state = {transferValue: null, editTransfer: false}
    }

    componentDidUpdate({ active, method, value }) {
        this.props.onRequestValue()

        let transferInput = ReactDOM.findDOMNode(this.refs.transferInput)

        if (this.state.editTransfer && transferInput !== document.activeElement) {
            ReactDOM.findDOMNode(this.refs.transferInput).select()
        }
    }

    render() {
        let {
            active, name, label, value, zoneCenter, transfer, avgTransfer, transferIsModified, unit, units, method,
            point, zone, climate, edit, centerValue, onTransferChange, onResetTransfer, onToggle, onRemove,
            fetchTransfer, receiveTransfer
        } = this.props
        let { transferValue, editTransfer } = this.state
        let className = 'variableConfig'

        let transferNode = (
            <span
                className="transferNode"
                onClick={() => this.setState({editTransfer: true})}
            >
                {transfer} {units[unit].label}
            </span>
        )

        if (zoneCenter === null) {
            zoneCenter = '--'
        }

        if (editTransfer) {
            transferNode = (
                <span>
                    <input
                        ref="transferInput"
                        type="text"
                        className="form form-control form-inline"
                        value={transferValue === null ? transfer : transferValue}
                        onChange={e => {
                            this.setState({transferValue: e.target.value})
                        }}
                        onBlur={e => {
                            if (parseFloat(e.target.value) !== transfer) {
                                onTransferChange(e.target.value, unit, units)
                            }

                            this.setState({transferValue: null, editTransfer: false})
                        }}
                        onKeyUp={e => {
                            if (e.key === 'Enter') {
                                e.target.blur()
                            }
                            if (e.key === 'Escape') {
                                this.setState({transferValue: null, editTransfer: false})
                            }
                        }}
                    />
                    {units[unit].label}
                </span>
            )
        }
        else if (transferIsModified && edit && method) {
            transferNode = (
                <div>
                    <div className="transferReset" onClick={() => onResetTransfer()}>reset</div>
                    {transferNode}
                </div>
            )
        }

        let center
        if (centerValue === null) {
            center = <span className="nodata">--</span>
        }
        else {
            center = <span>{centerValue} {units[unit].label}</span>
        }

        let tooltip = null
        if (edit) {
            tooltip = (
                <ReactTooltip id={name + "_Tooltip"} class="variable-tooltip" place="right" effect="solid">
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
                    <div>
                        <span className="tooltip-label">Zone climatic center:</span>
                        <strong>{zoneCenter} {units[unit].label}</strong>
                    </div>
                </ReactTooltip>
            )
        }

        return (
            <tr className={active ? "visible" : ""} data-tip data-for={name + "_Tooltip"}>
                <Synchro
                    hash={JSON.stringify([method, point, zone, climate.seedlot.time])}
                    createRequest={() => fetchTransfer(method, point, zone, climate.seedlot.time)}
                    onSuccess={transfer => receiveTransfer(transfer)}
                />

                <td>
                    <button
                        type="button"
                        className={"close" + (edit ? "" : " hidden")}
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
                    <strong>{name}</strong></td>
                <td>{center}</td>
                <td>{transferNode}</td>
                <td>
                    <span
                        className={"visibilityToggle glyphicon glyphicon-eye-open" + (edit ? "" : " hidden")}
                        onClick={e => {
                            e.stopPropagation()
                            onToggle()
                        }}
                    >
                    </span>

                    {tooltip}
                </td>
            </tr>
        )
    }
}

Variable.propTypes = {
    active: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    zoneCenter: PropTypes.number,
    transfer: PropTypes.number.isRequired,
    avgTransfer: PropTypes.number.isRequired,
    transferIsModified: PropTypes.bool.isRequired,
    unit: PropTypes.string.isRequired,
    units: PropTypes.object,
    method: PropTypes.string.isRequired,
    point: PropTypes.object,
    zone: PropTypes.string,
    climate: PropTypes.object.isRequired,
    centerValue: PropTypes.number,
    onTransferChange: PropTypes.func.isRequired,
    onResetTransfer: PropTypes.func.isRequired,
    onToggle: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    fetchTransfer: PropTypes.func.isRequired,
    receiveTransfer: PropTypes.func.isRequired,
}

export default Variable
