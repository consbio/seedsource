import { connect } from 'react-redux'
import PointChooser from '../componenets/PointChooser'
import { setLatitude, setLongitude } from '../actions/point'

const mapStateToProps = (state) => {
    let point = state.runConfiguration.point
    let lat = '', lon = ''

    if (point !== null) {
        lat = point.y ? point.y.toFixed(4) : ''
        lon = point.x ? point.x.toFixed(4) : ''
    }

    return {lat, lon}
}

const mapDispatchToProps = (dispatch) => {
    return {
        onBlur: (type, value) => {
            let number = parseFloat(value)

            if (isNaN(number)) {
                return
            }

            switch (type) {
                case 'lat':
                    dispatch(setLatitude(number))
                    break
                case 'lon':
                    dispatch(setLongitude(number))
                    break
            }

        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PointChooser)
