import { connect } from 'react-redux'
import PointChooser from '../componenets/PointChooser'
import { setLatitude, setLongitude } from '../actions/point'

const mapStateToProps = (state) => {
    let point = state.runConfiguration.point

    return {
        lat: point ? point.y : '',
        lon: point ? point.x : ''
    }
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
