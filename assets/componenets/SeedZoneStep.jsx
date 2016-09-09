import React, { PropTypes } from 'react'
import ConfigurationStep from '../containers/ConfigurationStep'

const getZoneLabel = zone => {
    if (zone === undefined) {
        return null
    }

    let label = zone.name

    if (zone.elevation_band) {
        label += ", " + zone.elevation_band[0] + "' - " + zone.elevation_band[1] + "'"
    }

    return label
}

const SeedZoneStep = ({ method, pointIsValid, selected, zones, number, active, isFetchingZones, onZoneChange }) => {
    if (method !== 'seedzone') {
        return null
    }

    let noZoneLabel = pointIsValid ? 'No zones at this location...' : 'Select a location...'

    if (!active) {
        let label = noZoneLabel

        if (selected) {
            label = getZoneLabel(zones.find(item => item.id === selected))
        }

        return (
            <ConfigurationStep title="Select a seed zone" number={number} name="seedzone" active={false}>
                <div>{label}</div>
            </ConfigurationStep>
        )
    }

    let content = (
        <select className="form-control" disabled>
            <option>{noZoneLabel}</option>
        </select>
    )

    if (zones.length) {
        content = (
            <select
                className="form-control"
                value={selected}
                disabled={isFetchingZones}
                onChange={e => {
                    e.preventDefault()
                    onZoneChange(e.target.value)
                }}
            >
                {zones.map(item => (
                    <option value={item.zone_uid} key={item.id}>{getZoneLabel(item)}</option>
                ))}
            </select>
        )
    }

    return (
        <ConfigurationStep title="Select a seed zone" number={number} name="seedzone" active={true}>
            {content}
        </ConfigurationStep>
    )
}

SeedZoneStep.propTypes = {
    active: PropTypes.bool.isRequired,
    selected: PropTypes.string,
    method: PropTypes.string.isRequired,
    zones: PropTypes.array.isRequired,
    pointIsValid: PropTypes.bool.isRequired,
    species: PropTypes.string.isRequired,
    isFetchingZones: PropTypes.bool.isRequired,
    onZoneChange: PropTypes.func.isRequired
}

export default SeedZoneStep
