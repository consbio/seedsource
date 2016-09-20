import React, { PropTypes } from 'react'
import ConfigurationStep from '../containers/ConfigurationStep'
import ObjectiveButton from '../containers/ObjectiveButton'

class ObjectiveStep extends React.Component {
    render() {
        let { number, active, objective } = this.props

        if (!active) {
            return (
                <ConfigurationStep title="Select objective" number={number} name="objective" active={false}>
                    <div>{objective === 'seedlots' ? 'Find seedlots' : 'Find planting sites'}</div>
                </ConfigurationStep>
            )
        }

        return (
            <ConfigurationStep title="Select objective" number={number} name="objective" active={true}>
                <div className="btn-group">
                    <ObjectiveButton name="seedlots">Find seedlots</ObjectiveButton>
                    <ObjectiveButton name="sites">Find planting sites</ObjectiveButton>
                </div>
            </ConfigurationStep>
        )
    }
}

ObjectiveStep.shouldRender = () => true

ObjectiveStep.propTypes = {
    number: PropTypes.number.isRequired,
    active: PropTypes.bool.isRequired,
    objective: PropTypes.string.isRequired
}

export default ObjectiveStep
