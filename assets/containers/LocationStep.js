import { connect } from 'react-redux'
import LocationStep from '../componenets/LocationStep'

const mapStateToProps = ({ runConfiguration }) => {
    let { objective, point, zones } = runConfiguration
    let { elevationAtPoint } = zones

    if (elevationAtPoint !== null) {
        elevationAtPoint = elevationAtPoint / 0.3048
    }

    return {objective, point, elevationAtPoint}
}

let container = connect(mapStateToProps)(LocationStep)

container.shouldRender = () => true

export default container
