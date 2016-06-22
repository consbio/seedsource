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
        onChange: (type, value) => {
            switch (type) {
                case 'lat':
                    dispatch(setLatitude(value))
                    break
                case 'lon':
                    dispatch(setLongitude(value))
                    break
            }

        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PointChooser)
