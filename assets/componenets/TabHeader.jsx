import React, { PropTypes } from 'react'

const TabHeader = ({ active, children, onClick }) => {
    let className = ''

    if (active) {
        className = 'active'
    }

    return (
        <li className={className}>
            <a
                href="#"
                onClick={e => {
                    e.preventDefault();
                    if (!active) {
                        onClick()
                    }
                }}
            >
                {children}
            </a>
        </li>
    )
}

TabHeader.propTypes = {
    active: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func.isRequired
}

export default TabHeader
