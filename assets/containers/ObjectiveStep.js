import { connect } from 'react-redux'
import ObjectiveStep from '../componenets/ObjectiveStep'

const mapStateToProps = ({ runConfiguration }) => {
    let { objective } = runConfiguration

    return {objective}
}

export default connect(mapStateToProps)(ObjectiveStep)
