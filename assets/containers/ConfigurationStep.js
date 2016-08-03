import { connect } from 'react-redux'
import { selectStep } from '../actions/step'
import ConfigurationStep from '../componenets/ConfigurationStep'

const mapDispatchToProps = (dispatch, { name }) => {
    return {
        onClick: () => {
            dispatch(selectStep(name))
        }
    }
}

export default connect(null, mapDispatchToProps)(ConfigurationStep)
