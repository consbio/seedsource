import { connect } from 'react-redux'
import ErrorModal from '../componenets/ErrorModal'
import { clearError } from '../actions/error'

const mapStateToProps = ({ error }) => {
    if (error === null) {
        return {show: false, title: '', message: '', debugInfo: null}
    }

    let { title, message, debugInfo } = error

    return {
        show: true,
        title,
        message,
        debugInfo
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onHide: () => dispatch(clearError())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ErrorModal)
