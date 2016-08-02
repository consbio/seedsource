import React, { PropTypes } from 'react'
import ConfigurationStep from '../containers/ConfigurationStep'
import PointChooser from '../containers/PointChooser'

let getObjectiveLabel = objective => (
    objective === 'seedlots' ? 'Select a planting site' : 'Select a seedlot location'
)

class LocationStep extends React.Component {
    render() {
        let { objective, number, point, elevationAtPoint, active } = this.props
        let elevation = null

        if (elevationAtPoint !== null) {
            elevation = (
                <div>
                    <div>&nbsp;</div>
                    <div><strong>Elevation at point:</strong> {elevationAtPoint.toFixed(2)} ft</div>
                </div>
            )
        }

        if (!active) {
            if (point !== null) {
                return (
                    <ConfigurationStep
                        title={getObjectiveLabel(objective)}
                        number={number}
                        name="location"
                        active={false}
                    >
                        <div>Lat: {point.y.toFixed(4)}, Lon: {point.x.toFixed(4)}</div>
                        {elevation}
                    </ConfigurationStep>
                )
            }
            else {
                return (
                    <ConfigurationStep
                        title={getObjectiveLabel(objective)}
                        number={number}
                        name="location"
                        active={false}
                    >
                        <div><em>Click to select a point.</em></div>
                    </ConfigurationStep>
                )
            }
        }

        let instruction = 'Locate your planting site'
        if (objective === 'sites') {
            instruction = 'Locate your seedlot (its climatic center)'
        }

        return (
            <ConfigurationStep title={getObjectiveLabel(objective)} number={number} name="location" active={true}>
                <div><em>{instruction}</em></div>
                <div><em>Use the map or enter coordinates</em></div>

                <div>&nbsp;</div>

                <PointChooser />
                {elevation}
                
                <div className="hidden">
                    <label className="control-label">Region</label>
                    <select className="form-control">
                        <option value="west1">West</option>
                    </select>
                </div>
            </ConfigurationStep>
        )
    }
}

LocationStep.shouldRender = () => true

LocationStep.propTypes = {
    active: PropTypes.bool.isRequired,
    point: PropTypes.object,
    objective: PropTypes.string.isRequired,
    elevationAtPoint: PropTypes.number,
    number: PropTypes.number.isRequired
}

export default LocationStep
