import React, { PropTypes } from 'react'
import { collapsibleSteps } from '../config'

const ConfigurationStep = ({ number, title, children, active, onClick }) => {
    if (collapsibleSteps) {
        return (
            <div
                className={"step" + (active ? " active" : "")}
                onClick={e => {
                    e.stopPropagation()
                    onClick()
                }}>
                <div className="gradientTop"></div>
                <h4><span className="badge">{ number }</span> { title }</h4>
                {children}
                <div className="gradientBottom"></div>
            </div>
        )
    }
    else {
        return (
            <div className="step noCollapse">
                <h4><span className="badge">{ number }</span> { title }</h4>
                {children}
            </div>
        )
    }
}

ConfigurationStep.propTypes = {
    active: PropTypes.bool.isRequired,
    number: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
}

export default ConfigurationStep
