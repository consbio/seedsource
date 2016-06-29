import { connect } from 'react-redux'
import TabHeader from '../componenets/TabHeader'
import { selectTab } from '../actions/tabs'

const mapStateToProps = (state, { name }) => {
    return {
        active: name === state.activeTab
    }
}

const mapDispatchToProps = (dispatch, { name }) => {
    return {
        onClick: () => {
            dispatch(selectTab(name))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TabHeader)
