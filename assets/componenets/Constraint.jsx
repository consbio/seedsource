import React, { PropTypes } from 'react'

const Constraint = ({ children, className, index, title, value, unit, onRemove }) => {
    return (
        <tr className={ 'constraint ' + className }>
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
            <td><strong>{title}</strong></td>
            <td>{value} {isNaN(value) ? '' : unit}</td>
            <td>{children}</td>
        </tr>
    )
}

Constraint.propTypes = {
    index: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    unit: PropTypes.string,
    onRemove: PropTypes.func.isRequired
}

export default Constraint;
