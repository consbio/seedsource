import React, { PropTypes } from 'react'
import ConfigurationStep from '../containers/ConfigurationStep'
import ElevationConstraint from '../containers/ElevationConstraint'
import PhotoperiodConstraint from '../containers/PhotoperiodConstraint'
import LatitudeConstraint from '../containers/LatitudeConstraint'
import LongitudeConstraint from '../containers/LongitudeConstraint'
import DistanceConstraint from '../containers/DistanceConstraint'

const constraintOptions = [
    {
        type: 'elevation',
        label: 'Elevation'
    },
    {
        type: 'photoperiod',
        label: 'Photoperiod'
    },
    {
        type: 'latitude',
        label: 'Latitude'
    },
    {
        type: 'longitude',
        label: 'Longitude'
    },
    {
        type: 'distance',
        label: 'Distance'
    }
]

const constraintMap = {
    elevation: ElevationConstraint,
    photoperiod: PhotoperiodConstraint,
    latitude: LatitudeConstraint,
    longitude: LongitudeConstraint,
    distance: DistanceConstraint
}

const ConstraintStep = ({ number, constraints, onChange }) => {
    return (
        <ConfigurationStep title="Apply constraints" number={number} name="constraints" active={true}>
            <table className="table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Name</th>
                        <th>Value</th>
                        <th>Range (+/-)</th>
                    </tr>
                </thead>
                <tbody>
                    {constraints.map(({ type, values }, i) => {
                        let tag = {type: constraintMap[type]}
                        return <tag.type index={i} values={values} key={type + '_' + i} />
                    })}
                </tbody>
            </table>
            <div>
                <select
                    className="form-control"
                    value=""
                    onChange={e => {
                        e.preventDefault()
                        onChange(e.target.value)
                    }}
                >
                    <option value="none">Add a constraint...</option>
                    {constraintOptions.map(constraint => {
                        return <option value={constraint.type} key={constraint.type}>{constraint.label}</option>
                    })}
                </select>
            </div>
        </ConfigurationStep>
    )
}

ConstraintStep.shouldRender = () => true

ConstraintStep.propTypes = {
    number: PropTypes.number.isRequired,
    active: PropTypes.bool,
    constraints: PropTypes.array,
    onChange: PropTypes.func.isRequired
}

export default ConstraintStep
