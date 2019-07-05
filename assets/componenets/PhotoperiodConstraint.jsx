import React, { PropTypes } from 'react'
import Constraint from '../containers/Constraint'
import EditableLabel from "./EditableLabel";

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const PhotoperiodConstraint = ({ index, value, hours, month, day, onHoursChange, onMonthChange, onDayChange }) => {
    let daysInMonth = 32 - new Date(1961, month-1, 32).getDate()
    let dayOptions = Array.from(Array(daysInMonth).keys())

    return (
        <Constraint index={index} value={value} title="Photoperiod" className="photoperiod-constraint">
            <div>
                <div>
                    <EditableLabel value={hours} onChange={value => onHoursChange(index, value)}>
                        &nbsp;hours
                    </EditableLabel>
                </div>
                <div className="photoperiod-date">
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
                </div>
            </div>
        </Constraint>
    )
}

PhotoperiodConstraint.propTypes = {
    index: PropTypes.number.isRequired,
    value: PropTypes.string,
    hours: PropTypes.string,
    month: PropTypes.number.isRequired,
    day: PropTypes.number.isRequired,
    onHoursChange: PropTypes.func.isRequired,
    onMonthChange: PropTypes.func.isRequired,
    onDayChange: PropTypes.func.isRequired
}

export default PhotoperiodConstraint
