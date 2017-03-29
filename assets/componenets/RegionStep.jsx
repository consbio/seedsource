import React, { PropTypes } from 'react'

import ConfigurationStep from './ConfigurationStep'
import RegionButton from '../containers/RegionButton'
import { regions } from '../config'

const RegionStep = ({ number, region, regionMethod, onChange }) => {
    let buttons = (
        <div>
            <div className="btn-group-sm btn-group">
                <RegionButton name="auto">Automatic</RegionButton>
                <RegionButton name="custom">Custom</RegionButton>
            </div>
        </div>
    )

    if (regionMethod === 'auto') {
        let regionLabel = region !== null ? regions.find(r => r.name == region).label : 'N/A'
        return (
            <ConfigurationStep title="Select region" number={number} name="region" active={true}>
                {buttons}
                <strong>Region:</strong> {regionLabel}
            </ConfigurationStep>
        )
    } else {
        return (
            <ConfigurationStep title="Select region" number={number} name="region" active={true}>
                {buttons}
                <div style={{marginTop:'3px'}}>
                    <strong>Region:</strong>
                    <select
                        className="form-control form-inline"
                        value={region ? region : regions[0].name}
                        onChange={e => {
                            e.preventDefault()
                            onChange(e.target.value)
                        }}>
                        {regions.map(r => (
                            <option value={r.name} key={r.name}>{r.label}</option>
                        ))}
                    </select>
                </div>
            </ConfigurationStep>
        )
    }
}

RegionStep.propTypes = {
    number: PropTypes.number.isRequired,
    active: PropTypes.bool.isRequired,
    region: PropTypes.string,
    regionMethod: PropTypes.string.isRequired,
}

export default RegionStep
