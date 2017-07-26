import React, { PropTypes } from 'react'
import Constraint from '../containers/Constraint'
import ConstraintMinMax from './ConstraintRange'

const LatitudeConstraint = ({ index, min, max, onMinChange, onMaxChange }) => (
    <Constraint index={index} title="Latitude" className="latlon-constraint">
        <ConstraintRange index={index} min={min} max={max} onMinChange={onMinChange} onMaxChange={onMaxChange} />
        <span>&nbsp;&deg;N</span>
    </Constraint>
)

LatitudeConstraint.propTypes = {
    index: PropTypes.number.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
    onMinChange: PropTypes.func.isRequired,
    onMaxChange: PropTypes.func.isRequired
}

export default LatitudeConstraint
