import React, { PropTypes } from 'react'
import ConfigurationStep from '../containers/ConfigurationStep'
import MethodButton from '../containers/MethodButton'
import SpeciesChooser from '../containers/SpeciesChooser'
import SeedZoneChooser from '../containers/SeedZoneChooser'

const TransferStep = ({ number, active, objective, method, center, onCenterChange }) => {
    if (!active) {
        let label

        if (method === 'seedzone') {
            label = 'Transfer limits based on seed zone, climatic center based on the selected location'

            if (center === 'zone') {
                label = 'Transfer limits and climatic center based on seed zone'
            }
        }
        else {
            label = 'Custom transfer limits, climatic center based on the selected location'
        }

        return (
            <ConfigurationStep title="Select transfer limit method" number={number} name="transfer" active={false}>
                <div>{label}</div>
            </ConfigurationStep>
        )
    }

    let centerNode = null

    if (method === 'seedzone' && objective === 'sites') {
        centerNode = (
            <div>
                <div>&nbsp;</div>
                <em>Which should be used as the climatic center?</em>
                <div className="radio">
                    <label>
                        <input
                            type="radio"
                            checked={center === 'point'}
                            onChange={() => onCenterChange('point')}
                        />
                        The value at the selected location
                    </label>
                    <label>
                        <input
                            type="radio"
                            checked={center === 'zone'}
                            onChange={() => onCenterChange('zone')}
                        />
                        The climatic center of the zone
                    </label>
                </div>
            </div>
        )
    }

    return (
        <ConfigurationStep title="Select transfer limit method" number={number} name="transfer" active={true}>
            <div className="btn-group" style={{display: 'inline-block'}}>
                <MethodButton name="custom">Custom</MethodButton>
                <MethodButton name="seedzone">Zone</MethodButton>
            </div>
            {centerNode}
            <SpeciesChooser />
            <SeedZoneChooser />
        </ConfigurationStep>
    )
}

TransferStep.shouldRender = () => true

TransferStep.propTypes = {
    active: PropTypes.bool.isRequired,
    objective: PropTypes.string.isRequired,
    method: PropTypes.string.isRequired,
    center: PropTypes.string.isRequired,
    onCenterChange: PropTypes.func.isRequired
}

export default TransferStep
