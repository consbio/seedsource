import { connect } from 'react-redux'
import VariableStep from '../componenets/VariableStep'

const mapStateToProps = ({ runConfiguration }) => {
    let { variables, region, regionMethod } = runConfiguration

    return { variables, region, regionMethod }
}

export default connect(mapStateToProps)(VariableStep)
