import React, { PropTypes } from 'react'
import ConfigurationStep from '../containers/ConfigurationStep'

class SeedZoneStep extends React.Component {
    componentWillUpdate(newProps) {
        let { method, onFetchZones, point, species } = newProps
        let pointChanged = JSON.stringify(point) != JSON.stringify(this.props.point)
        let methodChanged = method !== this.props.method
        let speciesChanged = species !== this.props.species

        if (method === 'seedzone' && (pointChanged || methodChanged || speciesChanged)) {
            onFetchZones()
        }
    }

    render() {
        let { method, selected, zones, number, active, isFetchingZones, onZoneChange } = this.props

        if (method !== 'seedzone') {
            return null
        }

        let content = (
            <select className="form-control" disabled>
                <option>Select a location...</option>
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
                        <option value={item.id} key={item.id}>{item.name}</option>
                    ))}
                </select>
            )
        }

        return (
            <ConfigurationStep title="Select a seed zone" number={number} name="seedzone" active={active}>
                {content}
            </ConfigurationStep>
        )
    }
}

SeedZoneStep.propTypes = {
    active: PropTypes.bool.isRequired,
    selected: PropTypes.number,
    method: PropTypes.string.isRequired,
    zones: PropTypes.array.isRequired,
    point: PropTypes.object,
    species: PropTypes.string.isRequired,
    isFetchingZones: PropTypes.bool.isRequired,
    onFetchZones: PropTypes.func.isRequired,
    onZoneChange: PropTypes.func.isRequired
}

export default SeedZoneStep
