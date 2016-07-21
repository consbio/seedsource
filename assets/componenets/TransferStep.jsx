import React from 'react'
import ConfigurationStep from './ConfigurationStep'
import MethodButton from '../containers/MethodButton'

class TransferStep extends React.Component {
    render() {
        let { number } = this.props

        return (
            <ConfigurationStep title="Select transfer limit method" number={number}>
                <div className="btn-group" style={{display: 'inline-block'}}>
                    <MethodButton name="seedzone">Seed Zone</MethodButton>
                    <MethodButton name="custom">Custom</MethodButton>
                </div>
            </ConfigurationStep>
        )
    }
}

TransferStep.shouldRender = () => true

export default TransferStep
