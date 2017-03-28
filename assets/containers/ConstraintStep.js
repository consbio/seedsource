import { connect } from 'react-redux'
import ConstraintStep from '../componenets/ConstraintStep'
import { addConstraint } from '../actions/constraints'

const mapStateToProps = ({ runConfiguration }) => {
    let { constraints } = runConfiguration

    return {constraints}
}

const mapDispatchToProps = dispatch => {
    return {
        onChange: constraint => {
            dispatch(addConstraint(constraint))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ConstraintStep)
