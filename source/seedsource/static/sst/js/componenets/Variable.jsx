import { PropTypes } from 'react'

const Variable = ({ active, index, name, label, value, transfer, onChange }) => {
    let transferNode

    if (!active) {
        transferNode = <span>{transfer}</span>
    }
    else {
        transferNode = (
            <input
                type="text"
                value={transfer}
                className="form-control form"
                onChange={e => {
                    onChange(e.target.value)
                }}
            />
        )
    }

    return (
        <div className="variableConfig">
            <button type="button" className="close"><span aria-hidden="true">&times;</span></button>
            <div>
                <div>
                    <strong>{name}: {label}</strong>
                </div>
            </div>
            <table>
                <tr>
                    <td>Value: {value}</td>
                    <td className="right">Transfer limit (+/-): {transferNode}</td>
                </tr>
            </table>
        </div>
    )
}

Variable.propTypes = {
    active: PropTypes.bool.isRequired,
    index: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType(PropTypes.number, PropTypes.string).isRequired,
    transfer: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired
}

export default Variable
