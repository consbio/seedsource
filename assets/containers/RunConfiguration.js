import { connect } from 'react-redux'
import RunConfiguration from '../componenets/RunConfiguration'

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

export default connect(mapStateToProps)(RunConfiguration)
