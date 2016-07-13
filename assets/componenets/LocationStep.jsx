import React from 'react'
import ConfigurationStep from './ConfigurationStep'
import PointChooser from '../containers/PointChooser'

class LocationStep extends ConfigurationStep {
    renderStep() {
        return (
            <div>
                <PointChooser />

                <div>&nbsp;</div>
                <div className="hidden">
                    <label className="control-label">Region</label>
                    <select className="form-control">
                        <option value="west1">West</option>
                    </select>
                </div>
            </div>
        )
    }
}

export default LocationStep
