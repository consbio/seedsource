import { connect } from 'react-redux'
import LatitudeConstraint from '../componenets/LatitudeConstraint'
import { updateConstraintValues } from '../actions/constraints'

const mapStateToProps = ({ runConfiguration }, { values }) => {
    let { y } = runConfiguration.point
    let { range } = values

    let value = y !== '' ? y.toFixed(2) : '--'
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

export default connect(mapStateToProps, mapDispatchToProps)(LatitudeConstraint)
