import React, { PropTypes } from 'react'
import ConfigurationStep from './ConfigurationStep'

class SeedZoneStep extends ConfigurationStep {
    componentWillUpdate(newProps) {
        let { method, zones, onFetchZones, point, species } = newProps
        let pointChanged = JSON.stringify(point) != JSON.stringify(this.props.point)
        let methodChanged = method !== this.props.method
        let speciesChanged = species !== this.props.species

        if (method === 'seedzone' && (pointChanged || methodChanged || speciesChanged)) {
            onFetchZones()
        }
    }

    renderStep() {
        let { method, selected, zones, isFetchingZones, onZoneChange } = this.props

        if (method !== 'seedzone') {
            return null
        }

        if (!zones.length) {
            return (
                <select className="form-control" disabled>
                    <option>Select a location...</option>
                </select>
            )
        }

        return (
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
                    <option value={item.id} key={item.id}>{item.name}</option>
                ))}
            </select>
        )
    }
}

SeedZoneStep.propTypes = Object.assign({}, ConfigurationStep.propTypes, {
    selected: PropTypes.number,
    method: PropTypes.string.isRequired,
    zones: PropTypes.array.isRequired,
    point: PropTypes.object,
    species: PropTypes.string.isRequired,
    isFetchingZones: PropTypes.bool.isRequired,
    onFetchZones: PropTypes.func.isRequired,
    onZoneChange: PropTypes.func.isRequired
})

export default SeedZoneStep
