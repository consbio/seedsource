import { connect } from 'react-redux'
import TransferStep from '../componenets/TransferStep'
import { selectCenter } from '../actions/variables'

const mapStateToProps = ({ runConfiguration }) => {
    let { method, center } = runConfiguration

    return {method, center}
}

const mapDispatchToProps = dispatch => {
    return {
        onCenterChange: center => {
            dispatch(selectCenter(center))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TransferStep)
