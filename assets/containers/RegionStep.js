import React, { PropTypes } from 'react'
import { connect } from 'react-redux'

import { setRegion } from '../actions/region'
import ConfigurationStep from './ConfigurationStep'
import RegionButton from './RegionButton'
import { regions } from '../config'

class RegionStep extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            number: props.number,
            active: props.active,
            region: props.region,
            regionMethod: props.regionMethod
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            number: nextProps.number,
            active: nextProps.active,
            region: nextProps.region,
            regionMethod: nextProps.regionMethod
        }, () => {
            if (this.state.regionMethod === 'custom' && !this.state.region) {
                this.props.onChange(regions[0].name)
            }
        })
    }

    render () {
        let buttons = (
            <div>
                <div className="btn-group-sm btn-group">
                    <RegionButton name="auto">Automatic</RegionButton>
                    <RegionButton name="custom">Custom</RegionButton>
                </div>
            </div>
        )

        if (this.state.regionMethod === 'auto') {
            let regionLabel = this.state.region !== null ? regions.find(r => r.name == this.state.region).label : 'N/A'
            return (
                <ConfigurationStep title="Select region" number={this.state.number} name="region" active={true}>
                    <strong>Region:</strong> {regionLabel}
                    {buttons}
                </ConfigurationStep>
            )
        } else {
            return (
                <ConfigurationStep title="Select region" number={this.state.number} name="region" active={true}>
                    <div style={{marginBottom:'3px'}}>
                        <strong>Region:</strong>
                        <select
                            className="form-control form-inline"
                            value={this.state.region ? this.state.region : regions[0].name}
                            onChange={e => {
                                e.preventDefault()
                                this.props.onChange(e.target.value)
                            }}>
                            {regions.map(r => (
                                <option value={r.name} key={r.name} >{r.label}</option>
                            ))}
                        </select>
                    </div>
                    {buttons}
                </ConfigurationStep>
            )
        }
    }
}

RegionStep.propTypes = {
    number: PropTypes.number.isRequired,
    active: PropTypes.bool.isRequired,
    region: PropTypes.string,
    regionMethod: PropTypes.string.isRequired,
}

const mapStateToProps = state => {
    let { region, regionMethod } = state.runConfiguration

    return { region, regionMethod }
}

const mapDispatchToProps = dispatch => {
    return {
        onChange: region => {
            dispatch(setRegion(region))
        }
    }
}

let container = connect(mapStateToProps, mapDispatchToProps)(RegionStep)

container.shouldRender = () => true

export default container
