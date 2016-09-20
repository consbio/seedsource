import React, { PropTypes } from 'react'
import { species as speciesList } from '../config'

const SpeciesChooser = ({ method, species, onSpeciesChange }) => {
    if (method !== 'seedzone') {
        return null
    }

    return (
        <div>
            <h4>Select a species</h4>
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
        </div>
    )
}

SpeciesChooser.propTypes = {
    method: PropTypes.string.isRequired,
    species: PropTypes.string.isRequired,
    onSpeciesChange: PropTypes.func.isRequired
}
    
export default SpeciesChooser
