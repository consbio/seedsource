import React, { PropTypes } from 'react'
import ConfigurationStep from '../containers/ConfigurationStep'
import { timeLabels } from '../config'

const ClimateStep = ({ climate, number, active, onChange }) => {
    let { seedlot, site } = climate
    let modelSelect = null

    if (!active) {
        let siteKey = site.time
        if (site.time !== '1961_1990' && site.time !== '1981_2010') {
            siteKey += site.model
        }

        return (
            <ConfigurationStep title="Select climate scenarios" number={number} name="climate" active={false}>
                <div><strong>Seedlot climate: </strong> {timeLabels[seedlot.time]}</div>
                <div><strong>Planting site climate: </strong> {timeLabels[siteKey]}</div>
            </ConfigurationStep>
        )
    }

    if (site.time !== '1961_1990' && site.time !== '1981_2010') {
        modelSelect = (
            <select
                className="form-control form-inline"
                value={site.model}
                onChange={(e) => {
                    e.preventDefault()
                    onChange('model', e.target.value, 'site')
                }}
            >
                <option value="rcp45">RCP4.5</option>
                <option value="rcp85">RCP8.5</option>
            </select>
        )
    }

    return (
        <ConfigurationStep title="Select climate scenarios" number={number} name="climate" active={true}>
            <div>
                <em>Which climate are the seedlots adapted to?</em>
            </div>

            <div>
                <select
                    className="form-control form-inline"
                    value={seedlot.time}
                    onChange={e => {
                        e.preventDefault()
                        onChange('year', e.target.value, 'seedlot')
                    }}
                >
                    <option value="1961_1990">1961 - 1990</option>
                    <option value="1981_2010">1981 - 2010</option>
                </select>
            </div>

            <div>&nbsp;</div>

            <div>
                <em>When should trees be best adapted to the planting site?</em>
            </div>

            <div>
                <select
                    className="form-control form-inline"
                    value={site.time}
                    onChange={e => {
                        e.preventDefault()
                        onChange('year', e.target.value, 'site')
                    }}
                >
                    <option value="1961_1990">1961 - 1990</option>
                    <option value="1981_2010">1981 - 2010</option>
                    <option value="2025">2011-2040</option>
                    <option value="2055">2041-2070</option>
                    <option value="2085">2071-2100</option>
                </select>
                { " " }
                {modelSelect}
            </div>
        </ConfigurationStep>
    )
}

ClimateStep.propTypes = {
    active: PropTypes.bool.isRequired,
    climate: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired
}

export default ClimateStep
