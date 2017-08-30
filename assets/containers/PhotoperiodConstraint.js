import { connect } from 'react-redux'
import PhotoperiodConstraint from '../componenets/PhotoperiodConstraint'
import { updateConstraintValues } from '../actions/constraints'

const getJulianDay = (year, month, day) => {
    let a = Math.floor((14 - month) / 12)
    let y = year + 4800 - a
    let m = month + 12 * a - 3
    let julianDate = (
        day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y/4) - Math.floor(y/100) + Math.floor(y/400) - 32045
    )

    return julianDate - 2451545 + .0008
}

const daylight = (year, month, day, lat, lon) => {
    let radians = degrees => degrees * Math.PI / 180
    let degrees = radians => radians * 180 / Math.PI

    let julianDay = getJulianDay(year, month, day)
    let solarNoon = julianDay - lon/360
    let solarAnomaly = (357.5291 + 0.98560028*solarNoon) % 360
    let equationOfCenter = (
        1.9148*Math.sin(radians(solarAnomaly)) +
        0.0200*Math.sin(radians(2*solarAnomaly)) +
        0.0003*Math.sin(radians(3*solarAnomaly))
    )
    let eclipticLongitude = (solarAnomaly + equationOfCenter + 180 + 102.9372) % 360
    let solarTransit = (
        2451545.5 + solarNoon + 0.0053*Math.sin(radians(solarAnomaly)) -
        0.0069*Math.sin(radians(2*eclipticLongitude))
    )
    let declination = Math.asin(Math.sin(radians(eclipticLongitude))*Math.sin(radians(23.44)))
    let hourAngle = Math.acos(
        (Math.sin(radians(-.83)) - Math.sin(radians(lat))*Math.sin(declination)) /
        (Math.cos(radians(lat))*Math.cos(declination))
    )
    let sunrise = solarTransit - degrees(hourAngle)/360
    let sunset = solarTransit + degrees(hourAngle)/360

    return (sunset-sunrise) * 24
}

const mapStateToProps = ({ runConfiguration }, { values }) => {
    let { hours, year, month, day } = values
    let { x, y } = runConfiguration.point

    if (hours !== null) {
        hours = hours.toFixed(1)
    }

    let value = '--'
    if (x !== '' && y !== '') {
        value = daylight(year, month, day, y, x).toFixed(1) + ' hours'
    }

    return {value, hours: hours, month, day}
}

const mapDispatchToProps = dispatch => {
    return {
        onHoursChange: (index, hours) => {
            let value = parseFloat(hours)

            if (!isNaN(value)) {
                dispatch(updateConstraintValues(index, {hours: value}))
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
