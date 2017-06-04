import React, { PropTypes } from 'react'
import Constraint from '../containers/Constraint'

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November',
    'December'
]

class PhotoperiodConstraint extends React.Component {
    constructor(props) {
        super(props)
        this.state = {minutesValue: null}
    }

    render() {
        let { index, minutes, month, day, onMinutesChange, onMonthChange, onDayChange } = this.props
        let { minutesValue } = this.state
        let daysInMonth = 32 - new Date(1961, month-1, 32).getDate()
        let dayOptions = Array.from(Array(daysInMonth).keys())

        if (minutes === null) {
            minutes = ''
        }

        return (
            <Constraint index={index} title="Photoperiod" className="photoperiod-constraint">
                <span className="constraint-label">Within&nbsp;</span>
                <input
                    type="text"
                    data-lpignore="true"
                    className="form form-control form-inline"
                    value={minutesValue === null ? minutes : minutesValue}
                    onChange={e => {
                        this.setState({minutesValue: e.target.value})
                    }}
                    onBlur={e => {
                        if (parseFloat(e.target.value) !== parseFloat(minutes)) {
                            onMinutesChange(index, e.target.value)
                        }

                        this.setState({minutesValue: null})
                    }}
                    onKeyUp={e => {
                        if (e.key === 'Enter') {
                            e.target.blur()
                        }
                    }}
                />
                <span className="constraint-label">&nbsp;minutes of&nbsp;</span>
                <select
                    className="form form-control form-inline photoperiod-month"
                    value={month-1}
                    onChange={e => {
                        e.preventDefault()
                        onMonthChange(index, e.target.value)
                    }}
                >
                    {monthNames.map((name, index) => {
                        return <option key={index} value={index}>{name}</option>
                    })}
                </select>
                <span>&nbsp;</span>
                <select
                    className="form form-control form-inline photoperiod-day"
                    value={day}
                    onChange={e => {
                        e.preventDefault()
                        onDayChange(index, e.target.value)
                    }}
                >
                    {dayOptions.map(dayNumber => {
                        return <option key={dayNumber} value={dayNumber+1}>{dayNumber+1}</option>
                    })}
                </select>
            </Constraint>
        )
    }
}

PhotoperiodConstraint.propTypes = {
    index: PropTypes.number.isRequired,
    minutes: PropTypes.number,
    month: PropTypes.number.isRequired,
    day: PropTypes.number.isRequired,
    onMinutesChange: PropTypes.func.isRequired,
    onMonthChange: PropTypes.func.isRequired,
    onDayChange: PropTypes.func.isRequired
}

export default PhotoperiodConstraint
