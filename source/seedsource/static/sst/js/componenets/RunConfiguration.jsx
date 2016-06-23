import { PropTypes } from 'react'
import { species as speciesList } from '../config'
import ObjectiveButton from '../containers/ObjectiveButton'
import PointChooser from '../containers/PointChooser'
import ClimateChooser from '../containers/ClimateChooser'
import Variables from '../containers/Variables'

let getObjectiveLabel = objective => (
    objective == 'seedlots' ? 'Select a planting site' : 'Select a seedlot location'
)

const RunConfiguration = ({ objective, species, onSpeciesChange }) => (
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
            <ClimateChooser />
        </div>

        <div className="step">
            <h4><span className="badge">4</span> Choose species</h4>
            <select
                className="form-control"
                value={species.name}
                onChange={e => {
                    e.preventDefault()
                    onSpeciesChange(e.target.value)
                }}
            >
                {speciesList.map(item => (
                    <option value={item.name}>{item.label}</option>
                ))}
            </select>
        </div>

        <div className="step">
            <h4><span className="badge">5</span> Choose variables & transfer limits</h4>
            <Variables />
        </div>
    </div>
)

RunConfiguration.propTypes = {
    objective: PropTypes.string.isRequired,
    species: PropTypes.string.isRequired,
    onSpeciesChange: PropTypes.func.isRequired
}

export default RunConfiguration
