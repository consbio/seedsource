import { connect } from 'react-redux'
import DistanceConstraint from '../componenets/DistanceConstraint'
import { updateConstraintValues } from '../actions/constraints'

const mapStateToProps = (state, { values }) => {
    let { distance, units } = values

    return { distance, units }
}

const mapDispatchToProps = dispatch => {
    return {
        onDistanceChange: (index, distance) => {
            let value = parseFloat(distance)

            if (!isNaN(value)) {
                dispatch(updateConstraintValues(index, {distance: value}))
            }
        },

        onUnitsChange: (index, units) => {
            dispatch(updateConstraintValues(index, {units}))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DistanceConstraint)
