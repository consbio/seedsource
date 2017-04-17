import { connect } from 'react-redux'
import PhotoperiodConstraint from '../componenets/PhotoperiodConstraint'
import { updateConstraintValues } from '../actions/constraints'

const mapStateToProps = (state, { values }) => {
    let { minutes, month, day } = values

    return {minutes, month, day}
}

const mapDispatchToProps = dispatch => {
    return {
        onMinutesChange: (index, minutes) => {
            let value = parseInt(minutes)

            if (!isNaN(value)) {
                dispatch(updateConstraintValues(index, {minutes: value}))
            }
        },

        onMonthChange: (index, month) => {
            dispatch(updateConstraintValues(index, {month: parseInt(month)+1}))
        },

        onDayChange: (index, day) => {
            dispatch(updateConstraintValues(index, {day: parseInt(day)}))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PhotoperiodConstraint)
