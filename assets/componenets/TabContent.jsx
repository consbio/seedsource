import React, { PropTypes } from 'react'

const TabContent = ({ active, children }) => {
    if (active) {
        return (
            <div className="tab-content">
                {children}
            </div>
        )
    }

    return null
}

TabContent.propTypes = {
    active: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired
}

export default TabContent
