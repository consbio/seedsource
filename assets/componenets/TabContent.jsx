import React, { PropTypes } from 'react'

const TabContent = ({ active, children }) => {
    return (
        <div className={"tab-content" + (active ? "" : " hidden")}>
            {children}
        </div>
    )
}

TabContent.propTypes = {
    active: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired
}

export default TabContent
