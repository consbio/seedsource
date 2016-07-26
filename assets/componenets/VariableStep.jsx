import React, { PropTypes } from 'react'
import ConfigurationStep from '../containers/ConfigurationStep'
import UnitButton from '../containers/UnitButton'
import Variables from '../containers/Variables'

class VariableStep extends React.Component {
    render() {
        let { number, active, variables } = this.props

        if (!active) {
            let content = <div><em>Click to add variables</em></div>

            if (variables.length > 0) {
                content = <Variables edit={false} />
            }

            return (
                <ConfigurationStep title="Select climate variables" number={number} name="variables" active={false}>
                    {content}
                </ConfigurationStep>
            )
        }

        return (
            <ConfigurationStep title="Select climate variables" number={number} name="variables" active={true}>
                <div>
                    <strong>Units: </strong>
                    <div className="btn-group-sm btn-group" style={{display: 'inline-block'}}>
                        <UnitButton name="metric">Metric</UnitButton>
                        <UnitButton name="imperial">Imperial</UnitButton>
                    </div>
                </div>

                <Variables edit={true} />
            </ConfigurationStep>
        )
    }
}

VariableStep.shouldRender = () => true

VariableStep.propTypes = {
    active: PropTypes.bool.isRequired,
    number: PropTypes.number.isRequired,
    variables: PropTypes.array.isRequired
}

export default VariableStep
