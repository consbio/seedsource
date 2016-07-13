import React, { PropTypes } from 'react'
import ConfigurationStep from './ConfigurationStep'

class ClimateChooser extends ConfigurationStep {
    renderStep() {
        let { year, model, onChange } = this.props
        let modelSelect = null

        if (year !== '1961_1990' && year !== '1981_2010') {
            modelSelect = (
                <select
                    className="form-control form-inline"
                    value={model}
                    onChange={(e) => {
                        e.preventDefault()
                        onChange('model', e.target.value)
                    }}
                >
                    <option value="rcp45">RCP 4.5</option>
                    <option value="rcp85">RCP 8.5</option>
                </select>
            )
        }

        return (
            <div>
                <select
                    className="form-control form-inline"
                    value={year}
                    onChange={(e) => {
                        e.preventDefault()
                        onChange('year', e.target.value)
                    }}
                >
                    <option value="1961_1990">1961 - 1990</option>
                    <option value="1981_2010">1981 - 2010</option>
                    <option value="2025">2025</option>
                    <option value="2055">2055</option>
                    <option value="2085">2085</option>
                </select>
                { " " }
                {modelSelect}
            </div>
        )
    }
}

ClimateChooser.propTypes = Object.assign({}, ConfigurationStep.propTypes, {
    year: PropTypes.string.isRequired,
    model: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
})

export default ClimateChooser
