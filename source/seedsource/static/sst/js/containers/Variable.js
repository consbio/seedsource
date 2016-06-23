import { connect } from 'react-redux'
import { modifyVariable } from '../actions/variables'
import Variable from '../componenets/Variable'

const mapStateToProps = (state, { variable, index }) => {
    let active = state.activeVariable === variable.name
    let { name, label, value, transfer } = variable

    if (value === null) {
        value = 'N/A'
    }

    return {active, index, name, label, value, transfer}
}

const mapDispatchToProps = (dispatch, { index }) => {
    return {
        onChange: transfer => {
            dispatch(modifyVariable(index, transfer))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Variable)
