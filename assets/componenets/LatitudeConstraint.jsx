import React, { PropTypes } from 'react'
import Constraint from '../containers/Constraint'
import EditableLabel from './EditableLabel'

const LatitudeConstraint = ({ index, value, range, onRangeChange }) => (
    <Constraint index={index} value={value} unit="&deg;N" title="Latitude">
        <EditableLabel value={range} onChange={range => onRangeChange(index, range)}>
            <span>&nbsp;&deg;N</span>
        </EditableLabel>
    </Constraint>
)

LatitudeConstraint.propTypes = {
    index: PropTypes.number.isRequired,
    range: PropTypes.string,
    value: PropTypes.string,
    onRangeChange: PropTypes.func.isRequired
}

export default LatitudeConstraint
