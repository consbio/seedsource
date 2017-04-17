import { connect } from 'react-redux'
import LatitudeConstraint from '../componenets/LatitudeConstraint'
import { updateConstraintValues } from '../actions/constraints'

const mapStateToProps = (state, { values }) => {
    let { min, max } = values

    return {min, max}
}

const mapDispatchToProps = dispatch => {
    return {
        onMinChange: (index, min) => {
            let value = parseFloat(min)

            if (!isNaN(value)) {
                dispatch(updateConstraintValues(index, {min: value}))
            }
        },
        onMaxChange: (index, max) => {
            let value = parseFloat(max)

            if (!isNaN(value)) {
                dispatch(updateConstraintValues(index, {max: value}))
            }
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LatitudeConstraint)
