import React, { PropTypes } from 'react'

const Constraint = ({ children, index, title, onRemove }) => (
    <div class="constraint">
        <div>
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
            <span><strong>{title}</strong></span>
        </div>
        <div class="constraint-body">
            {children}
        </div>
    </div>
)

Constraint.propTypes = {
    index: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    onRemove: PropTypes.func.isRequired
}

export default Constraint;
