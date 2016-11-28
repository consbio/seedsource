import React, { PropTypes } from 'react'
import RegionButton from '../containers/RegionButton'
import { regions } from '../config'

const RegionChooser = ({ region, regionMethod, onChange }) => {
    let buttons = (
        <div>
            <div className="btn-group-sm btn-group">
                <RegionButton name="auto">Automatic</RegionButton>
                <RegionButton name="custom">Custom</RegionButton>
            </div>
        </div>
    )

    if (regionMethod === 'auto') {
        let regionLabel = regions.find(r => r.name == region).label

        return (
            <div>
                <strong>Region:</strong> {regionLabel}
                {buttons}
            </div>
        )
    }
    else {
        return (
            <div>
                <div style={{marginBottom: "3px"}}>
                    <strong>Region: </strong>
                    <select
                        className="form-control form-inline"
                        value={region}
                        onChange={e => {
                            e.preventDefault()
                            onChange(e.target.value)
                        }}
                    >
                        {regions.map(r => (
                            <option value={r.name} key={r.name}>{r.label}</option>
                        ))}
                    </select>
                </div>
                {buttons}
            </div>
        )
    }
}

RegionChooser.propTypes = {
    region: PropTypes.string.isRequired,
    regionMethod: PropTypes.string.isRequired
}

export default RegionChooser
