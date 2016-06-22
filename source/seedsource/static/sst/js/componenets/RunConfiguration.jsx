import { PropTypes } from 'react'
import ObjectiveButton from '../containers/ObjectiveButton'
import PointChooser from '../containers/PointChooser'

let getObjectiveLabel = objective => (
    objective == 'seedlots' ? 'Select a planting site' : 'Select a seedlot location'
)

const RunConfiguration = ({ objective }) => (
    <div>
        <div className="step">
            <h4><span className="badge">1</span> Choose an objective</h4>
            <div className="btn-group">
                <ObjectiveButton name="seedlots">Find seedlots</ObjectiveButton>
                <ObjectiveButton name="sites">Find planting sites</ObjectiveButton>
            </div>
        </div>

        <div className="step">
            <h4><span className="badge">2</span> {getObjectiveLabel(objective)}</h4>
            <PointChooser />

            { /* Todo */ }

            <div>&nbsp;</div>
            <div>
                <label className="control-label">Region</label>
                <select className="form-control">
                    <option value="west1">West</option>
                </select>
            </div>
        </div>

        <div className="step">
        <h4><span className="badge">3</span> Target climate</h4>

    </div>
    </div>
)

RunConfiguration.propTypes = {
    objective: PropTypes.string.isRequired
}

export default RunConfiguration
