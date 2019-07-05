import { connect } from 'react-redux'
import ElevationConstraint from '../componenets/ElevationConstraint'
import { updateConstraintValues } from '../actions/constraints'

const mapStateToProps = ({ runConfiguration }, { values }) => {
    let { unit, point } = runConfiguration
    let { range } = values
    let value = point.elevation

    if (value === null) {
        value = '--'
    }
    else {
        if (unit === 'imperial') {
            value /= 0.3048
            range /= 0.3048
        }

        value = Math.round(value)
        range = Math.round(range)
    }

    return {unit, value, range}
}

const mapDispatchToProps = dispatch => {
    return {
        onRangeChange: (index, range, unit) => {
            let rangeFloat = parseFloat(range)

            if (!isNaN(rangeFloat)) {
                if (unit === 'imperial') {
                    rangeFloat *= 0.3048
                }

                dispatch(updateConstraintValues(index, {range: rangeFloat}))
            }
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ElevationConstraint)
