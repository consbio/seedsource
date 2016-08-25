import React, { PropTypes } from 'react'

const TabContent = ({ active, children }) => {
    return (
        <div className={"tab-content" + (active ? "" : " hidden")}>
            {children}

            {/* Hack to get bottom of scrollable area to display correctly */}
            <div style={{height: '50px'}}></div>
        </div>
    )
}

TabContent.propTypes = {
    active: PropTypes.bool.isRequired,
    children: PropTypes.node.isRequired
}

export default TabContent
