import { connect } from 'react-redux'
import GroupedButton from '../componenets/GroupedButton'
import { selectMethod } from '../actions/variables'

const mapStateToProps = (state, { name }) => {
    return {
        active: name === state.runConfiguration.method
    }
}

const mapDispatchToProps = (dispatch, { name }) => {
    return {
        onClick: () => {
            dispatch(selectMethod(name))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupedButton)
