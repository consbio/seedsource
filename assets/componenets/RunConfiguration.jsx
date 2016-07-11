import React, { PropTypes } from 'react'
import { species as speciesList } from '../config'
import ObjectiveButton from '../containers/ObjectiveButton'
import PointChooser from '../containers/PointChooser'
import ClimateChooser from '../containers/ClimateChooser'
import Variables from '../containers/Variables'
import SaveModal from '../containers/SaveModal'
import UnitButton from '../containers/UnitButton'
import MethodButton from '../containers/MethodButton'
import SeedzoneButton from '../containers/SeedzoneButton'

let getObjectiveLabel = objective => (
    objective == 'seedlots' ? 'Select a planting site' : 'Select a seedlot location'
)

class RunConfiguration extends React.Component {
    componentDidUpdate({ job }) {
        let newJob = this.props.job

        if (newJob.isRunning && job.isFetching && !newJob.isFetching) {
            // Poll job status
            setTimeout(() => this.props.onPoll(newJob.jobId), 1000);
        }

        if (job.isRunning && !newJob.isRunning) {
            this.props.onDone(job.configuration)
        }
    }

    render() {
        let {
            objective, species, method, canRun, canSave, configuration, job, isLoggedIn, onSpeciesChange, onRun, onSave
        } = this.props
        let overlay = null

        if (job.isRunning) {
            overlay = (
                <div className="overlay">
                    <div className="progressContainer">
                        <h4>Calculating scores...</h4>
                        <div className="progress">
                            <div
                                className="progress-bar progress-bar-info progress-bar-striped active"
                                style={{width: '100%'}}
                            ></div>
                        </div>
                    </div>
                </div>
            )
        }

        let seedzoneButtonGroup = null
        if (method === 'seedzone') {
            seedzoneButtonGroup = (
                <div>
                    <strong>Seed zones: </strong>
                    <div className="btn-group btn-group-sm" style={{display: 'inline-block'}}>
                        <SeedzoneButton name="historic">Historic</SeedzoneButton>
                        <SeedzoneButton name="new">New</SeedzoneButton>
                    </div>
                </div>
            )
        }

        return (
            <div>
                {overlay}

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
                        value={species}
                        onChange={e => {
                            e.preventDefault()
                            onSpeciesChange(e.target.value)
                        }}
                    >
                        {speciesList.map(item => (
                            <option value={item.name} key={item.name}>{item.label}</option>
                        ))}
                    </select>
                </div>

                <div className="step">
                    <h4><span className="badge">5</span> Choose variables & transfer limits</h4>

                    <div>
                        <strong>Method: </strong>
                        <div className="btn-group-sm btn-group" style={{display: 'inline-block'}}>
                            <MethodButton name="seedzone">Seed Zone</MethodButton>
                            <MethodButton name="custom">Custom</MethodButton>
                        </div>
                    </div>

                    {seedzoneButtonGroup}

                    <div>
                        <strong>Units: </strong>
                        <div className="btn-group-sm btn-group" style={{display: 'inline-block'}}>
                            <UnitButton name="metric">Metric</UnitButton>
                            <UnitButton name="imperial">Imperial</UnitButton>
                        </div>
                    </div>

                    <Variables />
                </div>

                <div>
                    <h4></h4>
                    <button
                        className="btn btn-lg btn-primary btn-block"
                        disabled={!canRun}
                        onClick={e => {
                            onRun(configuration)
                        }}
                    >
                        Run Tool
                    </button>
                </div>
                <div>
                    <h4></h4>
                    <div>
                        <button
                            className="btn btn-default pull-left"
                            disabled={!canSave}
                            onClick={() => {
                                if (!isLoggedIn) {
                                    alert('Please login to save your run')
                                    return
                                }

                                onSave()
                            }}
                        >
                            <span className="glyphicon glyphicon-save" aria-hidden="true"></span> Save Last Run
                        </button>
                        <button className="btn btn-default pull-right" disabled={!canSave}>
                            <span className="glyphicon glyphicon-file" aria-hidden="true"></span> Export PDF
                        </button>
                    </div>
                    <div style={{clear: 'both'}}></div>
                </div>

                <SaveModal />
            </div>
        )
    }
}

RunConfiguration.propTypes = {
    objective: PropTypes.string.isRequired,
    species: PropTypes.string.isRequired,
    method: PropTypes.string.isRequired,
    canRun: PropTypes.bool.isRequired,
    canSave: PropTypes.bool.isRequired,
    configuration: PropTypes.object.isRequired,
    job: PropTypes.object.isRequired,
    isLoggedIn: PropTypes.bool.isRequired,
    onSpeciesChange: PropTypes.func.isRequired,
    onRun: PropTypes.func.isRequired,
    onPoll: PropTypes.func.isRequired,
    onDone: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired
}

export default RunConfiguration
