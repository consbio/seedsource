import React, { PropTypes } from 'react'
import Constraint from '../containers/Constraint'

class DistanceConstraint extends React.Component {
    constructor(props) {
        super(props)
        this.state = {distanceValue: null}
    }

    render() {
        let { index, distance, unit, onDistanceChange, onUnitsChange } = this.props
        let { distanceValue } = this.state

        if (distance === null) {
            distance = ''
        }

        return (
            <Constraint index={index} title="Distance" className="distance-constraint">
                <span className="constraint-label">Within&nbsp;</span>
                <input
                    type="text"
                    className="form form-control form-inline"
                    value={distanceValue === null ? distance : distanceValue}
                    onChange={e => {
                        this.setState({distanceValue: e.target.value})
                    }}
                    onBlur={e => {
                        if (parseFloat(e.target.value) !== parseFloat(distance)) {
                            onDistanceChange(index, e.target.value)
                        }

                        this.setState({distanceValue: null})
                    }}
                    onKeyUp={e => {
                        if (e.key === 'Enter') {
                            e.target.blur()
                        }
                    }}
                />
                <span>&nbsp;</span>
                <select
                    className="form form-control form-inline"
                    value={unit}
                    onChange={e => {
                        onUnitsChange(index, e.target.value)
                    }}
                >
                    <option value="miles">Miles</option>
                    <option value="kilometers">Kilometers</option>
                </select>
            </Constraint>
        )
    }
}

DistanceConstraint.propTypes = {
    index: PropTypes.number.isRequired,
    distance: PropTypes.number,
    unit: PropTypes.string,
    onDistanceChange: PropTypes.func,
    onUnitsChange: PropTypes.func
}

export default DistanceConstraint
