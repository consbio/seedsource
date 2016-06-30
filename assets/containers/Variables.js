import { connect } from 'react-redux'
import Variables from '../componenets/Variables'
import { variables as allVariables } from '../config'
import { addVariable, toggleVariable, fetchValue } from '../actions/variables'

const mapStateToProps = state => {
    let variables = state.runConfiguration.variables
    let names = variables.map(item => item.name)
    let unusedVariables = allVariables.filter(item => !names.includes(item.name))

    return {variables, unusedVariables}
}

const mapDispatchToProps = dispatch => {
    return {
        onChange: variable => {
            dispatch(addVariable(variable))
            dispatch(toggleVariable(variable))
            dispatch(fetchValue(variable))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Variables)
