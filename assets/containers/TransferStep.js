import { connect } from 'react-redux'
import TransferStep from '../componenets/TransferStep'

const mapStateToProps = ({ runConfiguration }) => {
    let { method } = runConfiguration

    return {method}
}

export default connect(mapStateToProps)(TransferStep)
