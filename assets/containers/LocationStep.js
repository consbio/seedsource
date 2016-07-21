import { connect } from 'react-redux'
import LocationStep from '../componenets/LocationStep'

const mapStateToProps = ({ runConfiguration }) => {
    let { objective } = runConfiguration

    return {objective}
}

let container = connect(mapStateToProps)(LocationStep)

container.shouldRender = () => true

export default container
