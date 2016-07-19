import React, { PropTypes } from 'react'
import Variable from '../containers/Variable'

const Variables = ({ variables, unusedVariables, onChange }) => (
    <div className="variablesList">
        <div>
            {variables.map((item, index) => (
                <Variable variable={item} index={index} key={item.name} />
            ))}
        </div>
        <div>
            <select
                className="form-control"
                value=""
                onChange={e => {
                    e.preventDefault()
                    onChange(e.target.value)
                }}
            >
                <option value="none">Add a variable...</option>
                {unusedVariables.map(item => (
                    <option value={item.name} key={item.name}>{item.name}: {item.label}</option>
                ))}
            </select>
        </div>
    </div>
)

Variables.propTypes = {
    variables: PropTypes.array.isRequired,
    unusedVariables: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired
}

export default Variables
