import React from 'react'
import { PropTypes } from 'react'

class PointChooser extends React.Component {
    constructor(props) {
        super(props)
        this.state = {latValue: null, lonValue: null}
    }

    render() {
        let {lat, lon, onBlur} = this.props

        return (
            <div className="coords">
                <strong>Lat: </strong>
                <input
                    type="text"
                    className="form-control form-inline"
                    value={this.state.latValue === null ? lat : this.state.latValue}
                    onChange={e => {
                        this.setState({latValue: e.target.value})
                    }}
                    onBlur={e => {
                        this.setState({latValue: null})
                        onBlur('lat', e.target.value)
                    }}
                />
                <strong>Lon: </strong>
                <input
                    type="text"
                    className="form-control form-inline"
                    value={this.state.lonValue === null ? lon : this.state.lonValue}
                    onChange={e => {
                        this.setState({lonValue: e.target.value})
                    }}
                    onBlur={e => {
                        this.setState({lonValue: null})
                        onBlur('lon', e.target.value)
                    }}
                />
            </div>
        )
    }
}

PointChooser.propTypes = {
    lat: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    lon: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onBlur: PropTypes.func.isRequired
}

export default PointChooser
