import { connect } from 'react-redux'
import SavedRun from '../componenets/SavedRun'
import { loadConfiguration } from '../actions/saves'

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
            dispatch(loadConfiguration(save.configuration, save))
        },

        onDelete: saveId => {

        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SavedRun)
