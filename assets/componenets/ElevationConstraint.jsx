import React, { PropTypes } from 'react'
import Constraint from '../containers/Constraint'
import EditableLabel from './EditableLabel'

const ElevationConstraint = ({ index, value, range, unit, onRangeChange }) => {
    let unitLabel = unit === 'metric' ? 'm' : 'ft'

    return (
        <Constraint index={index} value={value} unit={unitLabel} title="Elevation">
            <EditableLabel value={range} onChange={range => onRangeChange(index, range, unit)}>
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
