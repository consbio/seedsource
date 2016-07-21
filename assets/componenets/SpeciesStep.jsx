import React, { PropTypes } from 'react'
import ConfigurationStep from './ConfigurationStep'
import { species as speciesList } from '../config'

class SpeciesStep extends React.Component {
    render() {
        let { method, species, number, onSpeciesChange } = this.props

        if (method !== 'seedzone') {
            return null
        }

        return (
            <ConfigurationStep title="Select a species" number={number}>
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
    method: PropTypes.string.isRequired,
    species: PropTypes.string.isRequired,
    onSpeciesChange: PropTypes.func.isRequired
}
    
export default SpeciesStep
