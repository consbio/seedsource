import { connect } from 'react-redux'
import RegionStep from '../componenets/RegionStep'
import { setRegion } from '../actions/region'

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

export default connect(mapStateToProps, mapDispatchToProps)(RegionStep)
