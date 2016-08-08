import { connect } from 'react-redux'
import RunConfiguration from '../componenets/RunConfiguration'
import { createJob, fetchJobStatus, finishJob } from '../actions/job'
import { showSaveModal } from '../actions/saves'
import { createPDF } from '../actions/pdf'
import { setError } from '../actions/error'

const configurationCanRun = ({point, variables}) =>  {
    if (point === null || point.x === null || point.y === null) {
        return false
    }

    return variables.length > 0 && variables.every(item => item.value !== null && item.isFetching === false)
}

const mapStateToProps = state => {
    let { activeStep, runConfiguration, lastRun, job, isLoggedIn, pdfIsFetching } = state
    let { objective, species, method } = runConfiguration

    return {
        canRun: configurationCanRun(runConfiguration) && !job.isRunning,
        canSave: lastRun !== null,
        configuration: runConfiguration,
        state,
        objective,
        species,
        method,
        job,
        isLoggedIn,
        activeStep,
        pdfIsFetching
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onRun: configuration => {
            if (configuration.variables.some(item => item.transfer === null)) {
                dispatch(setError(
                    'Configuration error',
                    'Cannot calculate scores: one or more of your variables has no transfer limit, or a limit of 0.'
                ))
                return
            }

            dispatch(createJob(configuration))
        },

        onPoll: jobId => {
            dispatch(fetchJobStatus(jobId))
        },

        onDone: configuration => {
            dispatch(finishJob(configuration))
        },

        onSave: isLoggedIn => {
            if (!isLoggedIn) {
                dispatch(setError('Login required', 'Please login to save your run.'))
                return
            }

            dispatch(showSaveModal())
        },

        onPDF: () => {
            dispatch(createPDF())
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RunConfiguration)
