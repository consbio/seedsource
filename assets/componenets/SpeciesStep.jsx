import React, { PropTypes } from 'react'
import ConfigurationStep from '../containers/ConfigurationStep'
import { species as speciesList } from '../config'

class SpeciesStep extends React.Component {
    render() {
        let { method, species, number, active, onSpeciesChange } = this.props

        if (method !== 'seedzone') {
            return null
        }

        return (
            <ConfigurationStep title="Select a species" number={number} name="species" active={active}>
                <select
                    className="form-control"
                    value={species}
                    onChange={e => {
                        e.preventDefault()
                        onSpeciesChange(e.target.value)
                    }}
                >
                    <option value="generic">Generic</option>

                    {speciesList.map(item => (
                        <option value={item.name} key={item.name}>{item.label}</option>
                    ))}
                </select>
            </ConfigurationStep>
        )
    }
}

SpeciesStep.propTypes = {
    active: PropTypes.bool.isRequired,
    method: PropTypes.string.isRequired,
    species: PropTypes.string.isRequired,
    onSpeciesChange: PropTypes.func.isRequired
}
    
export default SpeciesStep
