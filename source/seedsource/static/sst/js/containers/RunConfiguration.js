import { connect } from 'react-redux'
import RunConfiguration from '../componenets/RunConfiguration'

const mapStateToProps = (state, { name }) => {
    return {
        objective: state.runConfiguration.objective
    }
}

export default connect(mapStateToProps)(RunConfiguration)
