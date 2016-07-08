import React from 'react'
import ReactDOM from 'react-dom'
import { PropTypes } from 'react'

class Variable extends React.Component {
    constructor(props) {
        super(props)
        this.state = {transferValue: null}
    }

    componentDidMount() {
        if (this.props.active) {
            ReactDOM.findDOMNode(this.refs.transferInput).select()
        }
    }

    componentDidUpdate({active, value}) {
        this.props.onRequestValue()
        
        if (!active && this.props.active) {
            ReactDOM.findDOMNode(this.refs.transferInput).select()
        }
    }

    render() {
        let {
            active, index, name, label, value, transfer, unit, units, onTransferBlur, onClick, onRemove
        } = this.props
        let { transferValue } = this.state
        let className = 'variableConfig'
        let transferNode

        if (value === null) {
            value = 'N/A'
        }
        else if (units !== null) {
            value = <span>{value} {units[unit].label}</span>
        }

        if (!active) {
            transferNode = <span>{transfer}</span>
        }
        else {
            className += ' focused'
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

        return (
            <div
                className={className}
                onClick={e => {
                    e.preventDefault()
                    onClick()
                }}
            >
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
    index: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    transfer: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    unit: PropTypes.string.isRequired,
    units: PropTypes.object,
    onTransferBlur: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onRequestValue: PropTypes.func.isRequired
}

export default Variable
