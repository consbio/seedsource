import React from 'react'
import ConfigurationStep from './ConfigurationStep'
import ObjectiveButton from '../containers/ObjectiveButton'

class ObjectiveStep extends ConfigurationStep {
    renderStep() {
        return (
            <div className="btn-group">
                <ObjectiveButton name="seedlots">Find seedlots</ObjectiveButton>
                <ObjectiveButton name="sites">Find planting sites</ObjectiveButton>
            </div>
        )
    }
}

export default ObjectiveStep
