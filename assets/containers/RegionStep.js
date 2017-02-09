import { connect } from 'react-redux'
import RegionStep from '../componenets/RegionStep'
import { selectRegion } from '../actions/region'

const mapStateToProps = state => {
    let { region, regionMethod, validRegions } = state.runConfiguration

    return { region, regionMethod, validRegions }
}

const mapDispatchToProps = dispatch => {
    return {
        onThumb: region => {
            dispatch(selectRegion(region))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RegionStep)
