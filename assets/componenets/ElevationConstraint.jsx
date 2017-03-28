import React, { PropTypes } from 'react'
import Constraint from '../containers/Constraint'

class ElevationConstraint extends React.Component {
    constructor(props) {
        super(props)
        this.state = {minValue: null, maxValue: null}
    }

    render() {
        let { index, min, max, unit, onMinChange, onMaxChange } = this.props

        let { minValue, maxValue } = this.state
        let unitLabel = unit === 'metric' ? 'meters' : 'feet'

        min = min === null ? '' : min
        max = max === null ? '' : max

        return (
            <Constraint index={index} title="Elevation" className="elevation-constraint">
                <span className="constraint-label">Between&nbsp;</span>
                <input
                    type="text"
                    className="form form-control form-inline"
                    value={minValue === null ? min : minValue}
                    onChange={e => {
                        this.setState({minValue: e.target.value})
                    }}
                    onBlur={e => {
                        if (parseFloat(e.target.value) !== parseFloat(min)) {
                            onMinChange(index, e.target.value, unit)
                        }

                        this.setState({minValue: null})
                    }}
                    onKeyUp={e => {
                        if (e.key === 'Enter') {
                            e.target.blur()
                        }
                    }}
                />

                <span className="constraint-label">&nbsp;and&nbsp;</span>
                <input
                    type="text"
                    className="form form-control form-inline"
                    value={maxValue === null ? max : maxValue}
                    onChange={e => {
                        this.setState({maxValue: e.target.value})
                    }}
                    onBlur={e => {
                        if (parseFloat(e.target.value) !== parseFloat(max)) {
                            onMaxChange(index, e.target.value, unit)
                        }

                        this.setState({maxValue: null})
                    }}
                    onKeyUp={e => {
                        if (e.key === 'Enter') {
                            e.target.blur()
                        }
                    }}
                />
                <span>&nbsp;{unitLabel}</span>
            </Constraint>
        )
    }
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
