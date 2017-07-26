import React, { PropTypes } from 'react'
import Constraint from '../containers/Constraint'
import ConstraintRange from './ConstraintRange'

const ElevationConstraint = ({ index, value, range, unit, onRangeChange }) => {
    let unitLabel = unit === 'metric' ? 'meters' : 'feet'

    return (
        <Constraint index={index} value={value} title="Elevation" className="elevation-constraint">
            <ConstraintRange index={index} value={value} range={range} unit={unit} onRangeChange={onRangeChange} />
            <span>&nbsp;{unitLabel}</span>
        </Constraint>
    )
}

ElevationConstraint.propTypes = {
    index: PropTypes.number.isRequired,
    range: PropTypes.number,
    value: PropTypes.number,
    unit: PropTypes.string.isRequired,
    onRangeChange: PropTypes.func.isRequired
}

export default ElevationConstraint
