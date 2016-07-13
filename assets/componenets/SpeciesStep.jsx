import React, { PropTypes } from 'react'
import ConfigurationStep from './ConfigurationStep'
import { species as speciesList } from '../config'

class SpeciesStep extends ConfigurationStep {
    renderStep() {
        let { method, species, onSpeciesChange } = this.props

        if (method !== 'seedzone') {
            return null
        }

        return (
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
        )
    }
}

SpeciesStep.propTypes = Object.assign({}, ConfigurationStep.propTypes, {
    method: PropTypes.string.isRequired,
    species: PropTypes.string.isRequired,
    onSpeciesChange: PropTypes.func.isRequired
})
    
export default SpeciesStep
