import React, { PropTypes } from 'react'
import ObjectiveStep from '../containers/ObjectiveStep'
import LocationStep from '../containers/LocationStep'
import RegionStep from '../containers/RegionStep'
import ClimateStep from '../containers/ClimateStep'
import TransferStep from '../containers/TransferStep'
import VariableStep from '../containers/VariableStep'
import ConstraintStep from '../containers/ConstraintStep'
import RunStep from '../containers/RunStep'
import { collapsibleSteps } from '../config'

let RunConfiguration = ({ state, objective, method, job, activeStep }) => {
    let overlay = null

    if (job.isRunning) {
        let label = <h4>Calculating scores...</h4>

        if (job.queued) {
            label = (
                <div>
                    <h4>Waiting for other jobs to finish...</h4>
                    <div>
                        Another job is currently running. Your job is queued and will run as soon as other jobs
                        are finished.
                    </div>
                </div>
            )
        }

        overlay = (
            <div className="overlay">
                <div className="progressContainer">
                    {label}
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

    let steps = [
        {type: ObjectiveStep, key: 'objective'},
        {type: LocationStep, key: 'location'},
        {type: RegionStep, key: 'region'},
        {type: ClimateStep, key: 'climate'},
        {type: TransferStep, key: 'transfer'},
        {type: VariableStep, key: 'variables'},
        {type: ConstraintStep, key: 'constraints'},
        {type: RunStep, key: 'run'}
    ]

    return (
        <div>
            {overlay}

            {steps.filter(item => item.type.shouldRender(state)).map((item, i) => {
                return (
                    <item.type
                        number={i + 1}
                        title={item.title}
                        key={item.key}
                        active={activeStep === item.key || !collapsibleSteps}
                    />
                )
            })}
        </div>
    )
}

RunConfiguration.propTypes = {
    activeStep: PropTypes.string.isRequired,
    state: PropTypes.object.isRequired,
    objective: PropTypes.string.isRequired,
    method: PropTypes.string.isRequired,
    job: PropTypes.object.isRequired
}

export default RunConfiguration
