import { connect } from 'react-redux'
import SavedRun from '../componenets/SavedRun'
import { loadConfiguration, resetConfiguration, deleteSave } from '../actions/saves'

const mapStateToProps = (state, props) => {
    let { active, save } = props

    return {active, save}
}

const mapDispatchToProps = (dispatch, { onClick }) => {
    return {
        onClick: () => {
            onClick()
        },

        onLoad: save => {
            dispatch(resetConfiguration())

            /* In some cases where the loaded configuration is similar to the previous one, certain events aren't
             * fired if the event is dispatched in the same event cycle as the reset event
             */
            setTimeout(() => dispatch(loadConfiguration(save.configuration, save)), 0)
        },

        onDelete: saveId => {
            dispatch(deleteSave(saveId))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SavedRun)
