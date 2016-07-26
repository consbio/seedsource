import React, { PropTypes } from 'react'
import ConfigurationStep from '../containers/ConfigurationStep'
import ObjectiveButton from '../containers/ObjectiveButton'

class ObjectiveStep extends React.Component {
    render() {
        let { number, active } = this.props

        return (
            <ConfigurationStep title="Choose an objective" number={number} name="objective" active={active}>
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
    active: PropTypes.bool.isRequired
}

export default ObjectiveStep
