import { connect } from 'react-redux'
import { selectZone } from '../actions/zones'
import SeedZoneStep from '../componenets/SeedZoneStep'

const mapStateToProps = ({ runConfiguration }) => {
    let { method, species, point, zones } = runConfiguration
    let { selected, matched, isFetchingZones } = zones

    let pointIsValid = point !== null && point.x !== null && point.y !== null

    return {
        zones: matched,
        species,
        selected,
        method,
        pointIsValid,
        isFetchingZones
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onZoneChange: zone => {
            dispatch(selectZone(zone))
        }
    }
}

let container = connect(mapStateToProps, mapDispatchToProps)(SeedZoneStep)

container.shouldRender = state => state.runConfiguration.method === 'seedzone'

export default container
