import React, { PropTypes } from 'react'

class ConfigurationStep extends React.Component {
    render() {
        let { number, name, title, children, active, onClick } = this.props

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
}

ConfigurationStep.propTypes = {
    active: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    number: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
}

export default ConfigurationStep
