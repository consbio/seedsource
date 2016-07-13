import { connect } from 'react-redux'
import RunConfiguration from '../componenets/RunConfiguration'
import { selectSpecies } from '../actions/species'
import { createJob, fetchJobStatus, finishJob } from '../actions/job'
import { showSaveModal } from '../actions/saves'

const configurationCanRun = ({point, variables}) =>  {
    if (point === null || point.x === null || point.y === null) {
        return false
    }

    return variables.length > 0 && variables.every(item => item.value !== null && item.isFetching === false)
}

const mapStateToProps = state => {
    let { runConfiguration, lastRun, job, isLoggedIn } = state
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
        isLoggedIn
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onSpeciesChange: species => {
            dispatch(selectSpecies(species))
        },

        onRun: configuration => {
            dispatch(createJob(configuration))
        },

        onPoll: jobId => {
            dispatch(fetchJobStatus(jobId))
        },

        onDone: configuration => {
            dispatch(finishJob(configuration))
        },

        onSave: () => {
            dispatch(showSaveModal())
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RunConfiguration)
