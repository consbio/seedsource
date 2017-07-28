import { connect } from 'react-redux'
import ElevationConstraint from '../componenets/ElevationConstraint'
import { updateConstraintValues } from '../actions/constraints'

const mapStateToProps = ({ runConfiguration }, { values }) => {
    let { unit, point } = runConfiguration
    let { min, max } = values
    let range = (max-min)/2
    let value = point.elevation

    if (unit === 'imperial') {
        value = value / 0.3048
        range = range / 0.3048
    }

    value = Math.round(value)
    range = Math.round(range)
    value = value !== null ? value : '--'

    return {unit, value, range}
}

const mapDispatchToProps = dispatch => {
    return {
        onRangeChange: (index, value, range, unit) => {
            let rangeFloat = parseFloat(range)

            if (!isNaN(rangeFloat)) {
                if (unit === 'imperial') {
                    rangeFloat *= 0.3048
                }

                let min = value - rangeFloat
                let max = value + rangeFloat

                dispatch(updateConstraintValues(index, {min, max}))
            }
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ElevationConstraint)
