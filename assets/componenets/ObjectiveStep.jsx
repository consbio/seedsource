import React from 'react'
import ConfigurationStep from './ConfigurationStep'
import ObjectiveButton from '../containers/ObjectiveButton'

class ObjectiveStep extends React.Component {
    render() {
        let { number } = this.props

        return (
            <ConfigurationStep title="Choose an objective" number={number}>
                <div className="btn-group">
                    <ObjectiveButton name="seedlots">Find seedlots</ObjectiveButton>
                    <ObjectiveButton name="sites">Find planting sites</ObjectiveButton>
                </div>
            </ConfigurationStep>
        )
    }
}

ObjectiveStep.shouldRender = () => true

export default ObjectiveStep
