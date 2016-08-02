import React, { PropTypes } from 'react'
import ConfigurationStep from './ConfigurationStep'
import PointChooser from '../containers/PointChooser'

let getObjectiveLabel = objective => (
    objective == 'seedlots' ? 'Select a planting site' : 'Select a seedlot location'
)

class LocationStep extends React.Component {
    render() {
        let { objective, elevationAtPoint, number } = this.props
        let elevation = null

        if (elevationAtPoint !== null) {
            elevation = (
                <div>
                    <div>&nbsp;</div>
                    <div><strong>Elevation at point:</strong> {elevationAtPoint.toFixed(2)} ft</div>
                </div>
            )
        }

        return (
            <ConfigurationStep title={getObjectiveLabel(objective)} number={number}>
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
    objective: PropTypes.string.isRequired,
    elevationAtPoint: PropTypes.number,
    number: PropTypes.number.isRequired
}

export default LocationStep
