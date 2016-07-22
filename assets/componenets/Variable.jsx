import React from 'react'
import ReactDOM from 'react-dom'
import { PropTypes } from 'react'
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
            active, name, label, value, transfer, transferIsModified, unit, units, method, point, zone, climate,
            onTransferChange, onResetTransfer, onToggle, onRemove, fetchTransfer, receiveTransfer
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

        if (editTransfer) {
            transferNode = (
                <input
                    ref="transferInput"
                    type="text"
                    className="form form-control"
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
            )
        }
        else if (transferIsModified) {
            transferNode = (
                <span>
                    <div className="modified">&nbsp;</div>
                    {transferNode}
                    <span className="transferReset" onClick={() => onResetTransfer()}>reset</span>
                </span>
            )
        }

        if (value === null) {
            value = 'N/A'
        }
        else {
            value = <span>{value} {units[unit].label}</span>
        }

        return (
            <tbody>
                <Synchro
                    hash={JSON.stringify([method, point, zone, climate.seedlot.time])}
                    createRequest={() => fetchTransfer(method, point, zone, climate.seedlot.time)}
                    onSuccess={transfer => receiveTransfer(transfer)}
                />
                <tr className={active ? "visible" : ""}>
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
                    <td><strong>{name}</strong></td>
                    <td>{value}</td>
                    <td>{transferNode}</td>
                    <td>
                        <span
                            className="visibilityToggle glyphicon glyphicon-eye-open"
                            onClick={e => {
                                e.stopPropagation()
                                onToggle()
                            }}
                        >
                        </span>
                    </td>
                </tr>
            </tbody>
        )
    }
}

Variable.propTypes = {
    active: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    transfer: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    transferIsModified: PropTypes.bool.isRequired,
    unit: PropTypes.string.isRequired,
    units: PropTypes.object,
    method: PropTypes.string.isRequired,
    point: PropTypes.object,
    zone: PropTypes.number,
    climate: PropTypes.object.isRequired,
    onTransferChange: PropTypes.func.isRequired,
    onResetTransfer: PropTypes.func.isRequired,
    onToggle: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    fetchTransfer: PropTypes.func.isRequired,
    receiveTransfer: PropTypes.func.isRequired,
}

export default Variable
