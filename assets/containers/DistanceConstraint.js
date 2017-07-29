import { connect } from 'react-redux'
import DistanceConstraint from '../componenets/DistanceConstraint'
import { updateConstraintValues } from '../actions/constraints'

const mapStateToProps = ({ runConfiguration }, { values }) => {
    let { unit, point } = runConfiguration
    let { x, y } = point
    let { range } = values

    if (unit === 'imperial') {
        range /= 1.60934
    }

    let value = x === '' || y === '' ? '--' : y.toFixed(2) + ' °N, ' + x.toFixed(2) + ' °E'
    range = Math.round(range)

    return {unit, value, range}
}

const mapDispatchToProps = dispatch => {
    return {
        onRangeChange: (index, range, unit) => {
            let rangeFloat = parseFloat(range)

            if (!isNaN(rangeFloat)) {
                if (unit === 'imperial') {
                    rangeFloat *= 1.60934
                }

                dispatch(updateConstraintValues(index, {range: rangeFloat}))
            }
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DistanceConstraint)
