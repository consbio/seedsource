import { connect } from 'react-redux'
import Constraint from '../componenets/Constraint'
import { removeConstraint } from '../actions/constraints'

const mapStateToProps = () => {
    return {}
}

const mapDispatchToProps = dispatch => {
    return {
        onRemove: index => {
            dispatch(removeConstraint(index))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Constraint)
