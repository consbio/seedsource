import { connect } from 'react-redux'
import GroupedButton from '../componenets/GroupedButton'
import { selectSeedzone } from '../actions/variables'

const mapStateToProps = (state, { name }) => {
    return {
        active: name === state.runConfiguration.seedzone
    }
}

const mapDispatchToProps = (dispatch, { name }) => {
    return {
        onClick: () => {
            dispatch(selectSeedzone(name))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupedButton)
