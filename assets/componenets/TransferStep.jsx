import React, { PropTypes } from 'react'
import ConfigurationStep from '../containers/ConfigurationStep'
import MethodButton from '../containers/MethodButton'

class TransferStep extends React.Component {
    render() {
        let { number, active, method } = this.props

        if (!active) {
            return (
                <ConfigurationStep title="Select transfer limit method" number={number} name="transfer" active={false}>
                    <div>{method === 'seedzone' ? "Seed Zone" : "Custom transfer limits"}</div>
                </ConfigurationStep>
            )
        }

        return (
            <ConfigurationStep title="Select transfer limit method" number={number} name="transfer" active={true}>
                <div className="btn-group" style={{display: 'inline-block'}}>
                    <MethodButton name="seedzone">Seed Zone</MethodButton>
                    <MethodButton name="custom">Custom</MethodButton>
                </div>
            </ConfigurationStep>
        )
    }
}

TransferStep.shouldRender = () => true

TransferStep.propTypes = {
    active: PropTypes.bool.isRequired,
    method: PropTypes.string.isRequired
}

export default TransferStep
