import React, { PropTypes } from 'react'

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

const SeedZoneChooser = ({ method, pointIsValid, selected, zones, isFetchingZones, onZoneChange }) => {
    if (method !== 'seedzone') {
        return null
    }

    let noZoneLabel = pointIsValid ? 'No zones at this location...' : 'Select a location...'

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
        <div>
            <h4>Select a seed zone</h4>
            {content}
        </div>
    )
}

SeedZoneChooser.propTypes = {
    selected: PropTypes.string,
    method: PropTypes.string.isRequired,
    zones: PropTypes.array.isRequired,
    pointIsValid: PropTypes.bool.isRequired,
    species: PropTypes.string.isRequired,
    isFetchingZones: PropTypes.bool.isRequired,
    onZoneChange: PropTypes.func.isRequired
}

export default SeedZoneChooser
