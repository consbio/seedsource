import { connect } from 'react-redux'
import ElevationConstraint from '../componenets/ElevationConstraint'
import { updateConstraintValues } from '../actions/constraints'

const mapStateToProps = ({ runConfiguration }, { values }) => {
    let { unit } = runConfiguration
    let { min, max } = values

    if (unit === 'imperial') {
        min = Math.round(min / 0.3048)
        max = Math.round(max / 0.3048)
    }

    return {unit, min, max}
}

const mapDispatchToProps = dispatch => {
    return {
        onMinChange: (index, min, unit) => {
            let value = parseFloat(min)

            if (!isNaN(value)) {
                dispatch(updateConstraintValues(index, {min: value}))
            }
        },
        onMaxChange: (index, max, unit) => {
            let value = parseFloat(max)

            if (!isNaN(value)) {
                dispatch(updateConstraintValues(index, {max: value}))
            }
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ElevationConstraint)
