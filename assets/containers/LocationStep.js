import { connect } from 'react-redux'
import LocationStep from '../componenets/LocationStep'

const mapStateToProps = ({ runConfiguration }) => {
    let { objective, point } = runConfiguration
    let { elevation } = point

    if (elevation !== null) {
        elevation = elevation / 0.3048
    }

    return {objective, point, elevation}
}

let container = connect(mapStateToProps)(LocationStep)

container.shouldRender = () => true

export default container
