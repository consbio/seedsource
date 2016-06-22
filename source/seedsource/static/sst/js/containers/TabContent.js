import { connect } from 'react-redux'
import TabContent from '../componenets/TabContent'

const mapStateToProps = (state, props) => {
    return {
        active: props.name === state.activeTab
    }
}

export default connect(mapStateToProps)(TabContent)
