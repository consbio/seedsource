import { connect } from 'react-redux'
import RunConfiguration from '../componenets/RunConfiguration'
import { fetchJobStatus, finishJob } from '../actions/job'

const mapStateToProps = state => {
    let { activeStep, runConfiguration, lastRun, job, pdfIsFetching } = state
    let { objective, method } = runConfiguration

    return {
        state,
        objective,
        method,
        job,
        activeStep
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onPoll: jobId => {
            dispatch(fetchJobStatus(jobId))
        },

        onDone: configuration => {
            dispatch(finishJob(configuration))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RunConfiguration)
