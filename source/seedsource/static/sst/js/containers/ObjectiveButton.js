import { connect } from 'react-redux'
import GroupedButton from '../componenets/GroupedButton'
import { selectObjective } from '../actions/objectives'

const mapStateToProps = (state, { name }) => {
    return {
        active: name === state.runConfiguration.objective
    }
}

const mapDispatchToProps = (dispatch, { name }) => {
    return {
        onClick: () => {
            dispatch(selectObjective(name))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupedButton)
