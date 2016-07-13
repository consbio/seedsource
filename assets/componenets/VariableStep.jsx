import React from 'react'
import ConfigurationStep from './ConfigurationStep'
import UnitButton from '../containers/UnitButton'
import Variables from '../containers/Variables'

class VariableStep extends ConfigurationStep {
    renderStep() {
        return (
            <div>
                <div>
                    <strong>Units: </strong>
                    <div className="btn-group-sm btn-group" style={{display: 'inline-block'}}>
                        <UnitButton name="metric">Metric</UnitButton>
                        <UnitButton name="imperial">Imperial</UnitButton>
                    </div>
                </div>

                <Variables />
            </div>
        )
    }
}

export default VariableStep
