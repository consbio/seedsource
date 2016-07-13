import React, { PropTypes } from 'react'

class ConfigurationStep extends React.Component {
    renderStep() {
        return null
    }

    render() {
        let { number, title } = this.props
        let stepContent = this.renderStep()

        if (stepContent === null) {
            return null
        }
        else {
            return (
                <div className="step">
                    <h4><span className="badge">{ number }</span> { title }</h4>
                    { stepContent }
                </div>
            )
        }
    }
}

ConfigurationStep.shouldRender = () => true

ConfigurationStep.propTypes = {
    number: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired
}

export default ConfigurationStep
