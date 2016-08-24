import React, { PropTypes } from 'react'
import ConfigurationStep from '../containers/ConfigurationStep'
import { species as speciesList } from '../config'

const SpeciesStep = ({ method, species, number, active, onSpeciesChange }) => {
    if (method !== 'seedzone') {
        return null
    }

    if (!active) {
        let label = 'Generic'
        let selected = speciesList.find(item => item.name === species)

        if (selected !== undefined) {
            label = selected.label
        }

        return (
            <ConfigurationStep title="Select a species" number={number} name="species" active={false}>
                <div>{label}</div>
            </ConfigurationStep>
        )
    }

    return (
        <ConfigurationStep title="Select a species" number={number} name="species" active={true}>
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

SpeciesStep.propTypes = {
    active: PropTypes.bool.isRequired,
    method: PropTypes.string.isRequired,
    species: PropTypes.string.isRequired,
    onSpeciesChange: PropTypes.func.isRequired
}
    
export default SpeciesStep
