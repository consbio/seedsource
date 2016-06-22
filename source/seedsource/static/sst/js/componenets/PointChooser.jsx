import { PropTypes } from 'react'

const PointChooser = ({ lat, lon, onChange }) => {
    return (
        <div className="coords">
            <strong>Lat: </strong>
            <input
                type="text"
                className="form-control form-inline"
                value={lat}
                onChange={e => {
                    e.preventDefault()
                    onChange('lat', e.target.value)
                }}
            />
            <strong>Lon: </strong>
            <input
                type="text"
                className="form-control form-inline"
                value={lon}
                onChange={e => {
                    e.preventDefault()
                    onChange('lon', e.target.value)
                }}
            />
        </div>
    )
}

PointChooser.propTypes = {
    lat: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    lon: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onChange: PropTypes.func.isRequired
}

export default PointChooser
