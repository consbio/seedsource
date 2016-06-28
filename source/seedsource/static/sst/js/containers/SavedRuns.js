import { connect } from 'react-redux'
import SavedRuns from '../componenets/SavedRuns'
import { fetchSaves } from '../actions/saves'

const mapStateToProps = ({ saves }) => {
    return {saves: saves.saves}
}

const mapDispatchToProps = dispatch => {
    return {
        onLoad: () => {
            dispatch(fetchSaves())
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SavedRuns)
