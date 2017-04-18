import React, { PropTypes } from 'react'
import Constraint from '../containers/Constraint'
import ConstraintMinMax from './ConstraintMinMax'

const ElevationConstraint = ({ index, min, max, unit, onMinChange, onMaxChange }) => {
    let unitLabel = unit === 'metric' ? 'meters' : 'feet'

    return (
        <Constraint index={index} title="Elevation" className="elevation-constraint">
            <ConstraintMinMax index={index} min={min} max={max} unit={unit} onMinChange={onMinChange} onMaxChange={onMaxChange}/>
            <span>&nbsp;{unitLabel}</span>
        </Constraint>
    )
}

ElevationConstraint.propTypes = {
    index: PropTypes.number.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
    unit: PropTypes.string.isRequired,
    onMinChange: PropTypes.func.isRequired,
    onMaxChange: PropTypes.func.isRequired
}

export default ElevationConstraint
