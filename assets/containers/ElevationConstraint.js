import { connect } from 'react-redux'
import ElevationConstraint from '../componenets/ElevationConstraint'
import { updateConstraintValues } from '../actions/constraints'

const mapStateToProps = ({ runConfiguration }, { values }) => {
    let { unit, point } = runConfiguration
    let { min, max } = values
    let range = (max-min)/2
    let value = point.elevation

    if (unit === 'imperial') {
        value = Math.round(value / 0.3048)
        range = Math.round(range / 0.3048)
    }

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

                let min = value - range
                let max = value + range

                dispatch(updateConstraintValues(index, {min, max}))
            }
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ElevationConstraint)
