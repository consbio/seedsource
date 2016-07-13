import React from 'react'
import ConfigurationStep from './ConfigurationStep'
import MethodButton from '../containers/MethodButton'

class TransferStep extends ConfigurationStep {
    renderStep() {
        return (
            <div className="btn-group" style={{display: 'inline-block'}}>
                <MethodButton name="seedzone">Seed Zone</MethodButton>
                <MethodButton name="custom">Custom</MethodButton>
            </div>
        )
    }
}

export default TransferStep
