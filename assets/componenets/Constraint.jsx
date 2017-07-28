import React, { PropTypes } from 'react'

const Constraint = ({ children, index, title, value, unit, onRemove }) => {
    let unitLabel = unit === 'metric' ? 'm' : 'ft'

    return (
        <tr>
            <td>
                <button
                    type="button"
                    className="close"
                    onClick={e => {
                        e.stopPropagation()
                        onRemove(index)
                    }}
                >
                    <span aria-hidden="true">&times;</span>
                </button>
            </td>
            <td>{title}</td>
            <td>{value} {unitLabel}</td>
            <td>{children}</td>
        </tr>
    )
}

Constraint.propTypes = {
    index: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    unit: PropTypes.string.isRequired,
    onRemove: PropTypes.func.isRequired
}

export default Constraint;
