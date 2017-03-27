import { connect } from 'react-redux'
import RunStep from '../componenets/RunStep'
import { setError } from '../actions/error'
import { createJob } from '../actions/job'
import { showSaveModal } from '../actions/saves'
import { createReport, setExportMethod } from '../actions/report'

const configurationCanRun = ({point, variables}) =>  {
    if (point === null || point.x === null || point.y === null) {
        return false
    }

    return variables.length > 0 && variables.every(item => item.value !== null && item.isFetching === false)
}

const mapStateToProps = ({ runConfiguration, lastRun, job, isLoggedIn, reportIsFetching }) => {
    return {
        canRun: configurationCanRun(runConfiguration) && !job.isRunning,
        canSave: lastRun !== null,
        configuration: runConfiguration,
        job,
        isLoggedIn,
        reportIsFetching
    }
}

const mapDispatchToProps = dispatch => {
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

        onSave: isLoggedIn => {
            if (!isLoggedIn) {
                dispatch(setError('Login required', 'Please login to save your run.'))
                return
            }

            dispatch(showSaveModal())
        },

        onExport: (name) => {
            dispatch(createReport(name))
        }
    }
}

let container = connect(mapStateToProps, mapDispatchToProps)(RunStep)

container.shouldRender = () => true

export default container
