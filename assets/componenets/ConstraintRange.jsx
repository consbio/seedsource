import React, { PropTypes } from 'react'

class ConstraintRange extends React.Component {
    constructor(props) {
        super(props)
        this.state = {rangeValue: null}
    }

    render() {
        let { index, value, range, unit, onRangeChange } = this.props
        let { rangeValue } = this.state

        range = range === null ? '' : range

        return (
            <input
                type="text"
                data-lpignore="true"
                className="form form-control form-inline"
                value={rangeValue === null ? range : rangeValue}
                onChange={e => {
                    this.setState({rangeValue: e.target.value})
                }}
                onBlur={e => {
                    if (parseFloat(e.target.value) !== parseFloat(range)) {
                        onRangeChange(index, value, e.target.value, unit)
                    }

                    this.setState({rangeValue: null})
                }}
                onKeyUp={e => {
                    if (e.key === 'Enter') {
                        e.target.blur()
                    }
                }}
            />
        )
    }
}

ConstraintRange.propTypes = {
    index: PropTypes.number.isRequired,
    range: PropTypes.number,
    value: PropTypes.number,
    unit: PropTypes.string,
    onRangeChange: PropTypes.func.isRequired
}

export default ConstraintRange
