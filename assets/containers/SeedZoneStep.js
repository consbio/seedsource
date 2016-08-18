import { connect } from 'react-redux'
import { fetchZones, selectZone } from '../actions/zones'
import SeedZoneStep from '../componenets/SeedZoneStep'

const mapStateToProps = ({ runConfiguration }) => {
    let { method, species, point, zones } = runConfiguration
    let { selected, matched, isFetchingZones } = zones

    return {
        zones: matched,
        species,
        selected,
        method,
        point,
        isFetchingZones
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onFetchZones: () => {
            dispatch(fetchZones())
        },
        onZoneChange: zone => {
            dispatch(selectZone(zone))
        }
    }
}

let container = connect(mapStateToProps, mapDispatchToProps)(SeedZoneStep)

container.shouldRender = state => state.runConfiguration.method === 'seedzone'

export default container
