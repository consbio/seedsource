import React from 'react'
import ReactDOM from 'react-dom'
import { PropTypes } from 'react'
import Synchro from '../containers/Synchro'

class Variable extends React.Component {
    constructor(props) {
        super(props)
        this.state = {transferValue: null}
    }

    componentDidMount() {
        let { active, method, onRequestTransfer } = this.props

        if (active && method === 'custom') {
            ReactDOM.findDOMNode(this.refs.transferInput).select()
        }
    }

    componentDidUpdate({ active, method, value }) {
        this.props.onRequestValue()
        
        if (!active && this.props.active && method === 'custom') {
            ReactDOM.findDOMNode(this.refs.transferInput).select()
        }
    }

    render() {
        let {
            active, name, label, value, transfer, unit, units, method, point, zone, climate, onTransferBlur, onClick,
            onRemove, fetchTransfer, receiveTransfer
        } = this.props
        let { transferValue } = this.state
        let className = 'variableConfig'
        let transferNode = <span>{transfer} {units[unit].label}</span>

        if (value === null) {
            value = 'N/A'
        }
        else if (units !== null) {
            value = <span>{value} {units[unit].label}</span>
        }

        if (active) {
            className += ' focused'

            if (method === 'custom') {
                transferNode = (
                    <input
                        ref="transferInput"
                        type="text"
                        value={transferValue === null ? transfer : transferValue}
                        className="form-control form"
                        onChange={e => {
                            this.setState({transferValue: e.target.value})
                        }}
                        onBlur={e => {
                            this.setState({transferValue: null})
                            onTransferBlur(e.target.value, unit, units)
                        }}
                        onKeyPress={e => {
                            if (e.key === 'Enter') {
                                e.target.blur()
                                onClick()
                            }
                        }}
                        onClick={e => {e.stopPropagation()}}
                    />
                )
            }
        }

        return (
            <div
                className={className}
                onClick={e => {
                    e.preventDefault()
                    onClick()
                }}
            >
                <Synchro
                    hash={JSON.stringify([method, point, zone, climate.seedlot.time])}
                    createRequest={() => fetchTransfer(method, point, zone, climate.seedlot.time)}
                    onSuccess={transfer => receiveTransfer(transfer)}
                />

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
                <div>
                    <div>
                        <strong>{name}: {label}</strong>
                    </div>
                </div>
                <table>
                    <tbody>
                    <tr>
                        <td>Value: {value}</td>
                        <td className="right">Transfer limit (+/-): {transferNode}</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

Variable.propTypes = {
    active: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    transfer: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    unit: PropTypes.string.isRequired,
    units: PropTypes.object,
    method: PropTypes.string.isRequired,
    point: PropTypes.object,
    zone: PropTypes.number,
    climate: PropTypes.object.isRequired,
    onTransferBlur: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    fetchTransfer: PropTypes.func.isRequired,
    receiveTransfer: PropTypes.func.isRequired
}

export default Variable
