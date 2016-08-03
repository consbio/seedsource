import React, { PropTypes } from 'react'
import SaveModal from '../containers/SaveModal'
import SeedzoneButton from '../containers/SeedzoneButton'
import ObjectiveStep from '../containers/ObjectiveStep'
import LocationStep from '../containers/LocationStep'
import ClimateStep from '../containers/ClimateStep'
import TransferStep from '../containers/TransferStep'
import SpeciesStep from '../containers/SpeciesStep'
import SeedZoneStep from '../containers/SeedZoneStep'
import VariableStep from '../containers/VariableStep'

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
            state, objective, species, method, canRun, canSave, configuration, job, isLoggedIn, activeStep, 
            pdfIsFetching, onRun, onSave, onPDF
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

        let steps = [
            {type: ObjectiveStep, key: 'objective'},
            {type: LocationStep, key: 'location'},
            {type: ClimateStep, key: 'climate'},
            {type: TransferStep, key: 'transfer'},
            {type: SpeciesStep, key: 'species'},
            {type: SeedZoneStep, key: 'seedzone'},
            {type: VariableStep, key: 'variables'}
        ]

        return (
            <div>
                {overlay}

                {steps.filter(item => item.type.shouldRender(state)).map((item, i) => {
                    return (
                        <item.type number={i + 1} title={item.title} key={item.key} active={activeStep === item.key} />
                    )
                })}

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
                        <button
                            className="btn btn-default pull-right"
                            disabled={!canSave || pdfIsFetching}
                            onClick={e => {
                                onPDF()
                            }}
                        >
                            <span className="glyphicon glyphicon-file" aria-hidden="true"></span>
                            {pdfIsFetching ? 'Please wait...' : 'Export PDF'}
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
    activeStep: PropTypes.string.isRequired,
    state: PropTypes.object.isRequired,
    objective: PropTypes.string.isRequired,
    species: PropTypes.string.isRequired,
    method: PropTypes.string.isRequired,
    canRun: PropTypes.bool.isRequired,
    canSave: PropTypes.bool.isRequired,
    configuration: PropTypes.object.isRequired,
    job: PropTypes.object.isRequired,
    isLoggedIn: PropTypes.bool.isRequired,
    pdfIsFetching: PropTypes.bool.isRequired,
    onRun: PropTypes.func.isRequired,
    onPoll: PropTypes.func.isRequired,
    onDone: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onPDF: PropTypes.func.isRequired
}

export default RunConfiguration
