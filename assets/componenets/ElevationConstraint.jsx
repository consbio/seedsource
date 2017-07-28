import React, { PropTypes } from 'react'
import Constraint from '../containers/Constraint'
import ConstraintRange from './ConstraintRange'
import EditableLabel from './EditableLabel'

const ElevationConstraint = ({ index, value, range, unit, onRangeChange }) => {
    let unitLabel = unit === 'metric' ? 'm' : 'ft'

    return (
        <Constraint index={index} value={value} unit={unit} title="Elevation" className="elevation-constraint">
            <EditableLabel value={range} onChange={range => onRangeChange(index, value, range, unit)}>
                &nbsp;{unitLabel}
            </EditableLabel>
        </Constraint>
    )
}

ElevationConstraint.propTypes = {
    index: PropTypes.number.isRequired,
    range: PropTypes.number,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    unit: PropTypes.string.isRequired,
    onRangeChange: PropTypes.func.isRequired
}

export default ElevationConstraint
