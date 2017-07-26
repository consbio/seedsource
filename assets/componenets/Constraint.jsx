import React, { PropTypes } from 'react'

const Constraint = ({ children, index, title, value, className, onRemove }) => (
    <tr>
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
        <td>{title}</td>
        <td>{value}</td>
        <td>{children}</td>
    </tr>
)

Constraint.propTypes = {
    index: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    onRemove: PropTypes.func.isRequired
}

export default Constraint;
