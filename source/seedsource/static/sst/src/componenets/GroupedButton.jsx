import React, { PropTypes } from 'react'

const GroupedButton = ({ active, children, onClick }) => {
    let className = active ? 'btn active' : 'btn'

    return (
        <a
            href="#"
            className={className}
            onClick={e => {
                e.preventDefault()
                onClick()
            }}
        >
            {children}
        </a>
    )
}

GroupedButton.propTypes = {
    active: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func.isRequired
}

export default GroupedButton
