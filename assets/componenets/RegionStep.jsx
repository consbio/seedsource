import React, { PropTypes } from 'react'
import ConfigurationStep from '../containers/ConfigurationStep'
import RegionButton from '../containers/RegionButton'
import { regions } from '../config'

const RegionStep = ({ number, active, region, regionMethod, validRegions, onThumb }) => {

    let canClick = regionMethod !== 'auto'

    let thumbnailButtons = regions.map(r => (
        <div className="col-xs-3 col-md-3" key={r.name}>
            <a href="#"
               className={
                   "thumbnail "
                   + (!canClick ? "thumbnail-disabled " : "")
                   + (r.name === region ? "active" : "")
               }
               onClick={e => {
                   e.preventDefault()
                   if (canClick) {
                       onThumb(r.name)
                   }}}>
                <img src={r.img} />
            </a>
            <p className="thumbnail-label">{r.label}</p>
        </div>
    ))

    return (
        <ConfigurationStep title="Select region" number={number} name="region" active={true}>
            <div>
                <strong>Select Mode: </strong>
                <div className="btn-group-sm btn-group" style={{display: 'inline-block'}}>
                    <RegionButton name="auto">Automatic</RegionButton>
                    <RegionButton name="custom">Custom</RegionButton>
                </div>
            </div>
            <div className="row">
                {thumbnailButtons}
            </div>
        </ConfigurationStep>
    )
}

RegionStep.propTypes = {
    number: PropTypes.number.isRequired,
    active: PropTypes.bool.isRequired,
    region: PropTypes.string.isRequired,
    regionMethod: PropTypes.string.isRequired,
    validRegions: PropTypes.array.isRequired
}

RegionStep.shouldRender = () => true

export default RegionStep