import { connect } from 'react-redux'
import TransferStep from '../componenets/TransferStep'
import { selectCenter } from '../actions/variables'

const mapStateToProps = ({ runConfiguration }) => {
    let { objective, method, center } = runConfiguration

    return {objective, method, center}
}

const mapDispatchToProps = dispatch => {
    return {
        onCenterChange: center => {
            dispatch(selectCenter(center))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(TransferStep)
