import React, { PropTypes } from 'react'
import ConfigurationStep from '../containers/ConfigurationStep'
import UnitButton from '../containers/UnitButton'
import Variables from '../containers/Variables'

class VariableStep extends React.Component {
    render() {
        let { number, active } = this.props

        return (
            <ConfigurationStep title="Select climate variables" number={number} name="variables" active={active}>
                <div>
                    <strong>Units: </strong>
                    <div className="btn-group-sm btn-group" style={{display: 'inline-block'}}>
                        <UnitButton name="metric">Metric</UnitButton>
                        <UnitButton name="imperial">Imperial</UnitButton>
                    </div>
                </div>

                <Variables />
            </ConfigurationStep>
        )
    }
}

VariableStep.shouldRender = () => true

VariableStep.propTypes = {
    active: PropTypes.bool.isRequired
}

export default VariableStep
