import React, { PropTypes } from 'react'
import Constraint from '../containers/Constraint'
import ConstraintMinMax from './ConstraintRange'

const LongitudeConstraint = ({ index, min, max, onMinChange, onMaxChange }) => (
    <Constraint index={index} title="Longitude" className="longitude-constraint">
        <ConstraintRange index={index} min={min} max={max} onMinChange={onMinChange} onMaxChange={onMaxChange} />
        <span>&nbsp;&deg;E</span>
    </Constraint>
)

LongitudeConstraint.propTypes = {
    index: PropTypes.number.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
    onMinChange: PropTypes.func.isRequired,
    onMaxChange: PropTypes.func.isRequired
}

export default LongitudeConstraint
