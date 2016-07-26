import { connect } from 'react-redux'
import LocationStep from '../componenets/LocationStep'

const mapStateToProps = ({ runConfiguration }) => {
    let { objective, point } = runConfiguration

    return {objective, point}
}

let container = connect(mapStateToProps)(LocationStep)

container.shouldRender = () => true

export default container
