import React, { PropTypes } from 'react'
import ConfigurationStep from '../containers/ConfigurationStep'
import RegionButton from '../containers/RegionButton'
import { regions } from '../config'

const RegionStep = ({ number, active, region, regionMethod, onChange }) => {

    let buttons = (
        <div>
            <div className="btn-group-sm btn-group">
                <RegionButton name="auto">Automatic</RegionButton>
                <RegionButton name="custom">Custom</RegionButton>
            </div>
        </div>
    )
    if (regionMethod === 'auto') {
        let regionLabel = region !== '' ? regions.find(r => r.name == region).label : 'N/A'
        return (
            <ConfigurationStep title="Select region" number={number} name="region" active={true}>
                <strong>Region:</strong> {regionLabel}
                {buttons}
            </ConfigurationStep>
        )
    } else {
        return (
            <ConfigurationStep title="Select region" number={number} name="region" active={true}>
                <div style={{marginBottom:'3px'}}>
                    <strong>Region:</strong>
                    <select
                        className="form-control form-inline"
                        value={region ? region : regions[0].name}
                        onChange={e => {
                            e.preventDefault()
                            onChange(e.target.value)
                        }}>
                        {regions.map(r => (
                            <option value={r.name} key={r.name} >{r.label}</option>
                        ))}
                    </select>
                </div>
                {buttons}
            </ConfigurationStep>
        )
    }
}

RegionStep.propTypes = {
    number: PropTypes.number.isRequired,
    active: PropTypes.bool.isRequired,
    region: PropTypes.string.isRequired,
    regionMethod: PropTypes.string.isRequired,
}

RegionStep.shouldRender = () => true

export default RegionStep