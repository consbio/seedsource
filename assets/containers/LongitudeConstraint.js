import { connect } from 'react-redux'
import { updateConstraintValues } from '../actions/constraints'
import LongitudeConstraint from '../componenets/LongitudeConstraint'

const mapStateToProps = ({ runConfiguration }, { values }) => {
    let { x } = runConfiguration.point
    let { range } = values

    let value = x !== '' ? x.toFixed(2) : '--'
    range = range.toFixed(2)

    return {value, range}
}

const mapDispatchToProps = dispatch => {
    return {
        onRangeChange: (index, range) => {
            let rangeFloat = parseFloat(range)

            if (!isNaN(rangeFloat)) {
                dispatch(updateConstraintValues(index, {range: rangeFloat}))
            }
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LongitudeConstraint)
