import { connect } from 'react-redux'
import GroupedButton from '../componenets/GroupedButton'
import { selectUnit } from '../actions/variables'

const mapStateToProps = (state, { name }) => {
    return {
        active: name === state.runConfiguration.unit
    }
}

const mapDispatchToProps = (dispatch, { name }) => {
    return {
        onClick: () => {
            dispatch(selectUnit(name))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupedButton)
