import { connect } from 'react-redux'
import GroupedButton from '../componenets/GroupedButton'
import { selectRegionMethod } from '../actions/region'

const mapStateToProps = (state, { name }) => {
    return {
        active: name === state.runConfiguration.regionMethod
    }
}

const mapDispatchToProps = (dispatch, { name }) => {
    return {
        onClick: () => {
            dispatch(selectRegionMethod(name))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupedButton)
