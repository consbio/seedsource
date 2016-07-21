import React, { PropTypes } from 'react'

class ConfigurationStep extends React.Component {
    render() {
        let { number, title, children } = this.props

        return (
            <div className="step">
                <h4><span className="badge">{ number }</span> { title }</h4>
                {children}
            </div>
        )
    }
}

ConfigurationStep.propTypes = {
    number: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired
}

export default ConfigurationStep
