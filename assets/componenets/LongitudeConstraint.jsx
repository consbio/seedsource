import React, { PropTypes } from 'react'
import Constraint from '../containers/Constraint'
import EditableLabel from "./EditableLabel";

const LongitudeConstraint = ({ index, value, range, onRangeChange }) => (
    <Constraint index={index} value={value} unit="&deg;E" title="Longitude">
        <EditableLabel value={range} onChange={range => onRangeChange(index, range)}>
            <span>&nbsp;&deg;E</span>
        </EditableLabel>
    </Constraint>
)

LongitudeConstraint.propTypes = {
    index: PropTypes.number.isRequired,
    value: PropTypes.string,
    range: PropTypes.string,
    onRangeChange: PropTypes.func.isRequired
}

export default LongitudeConstraint
