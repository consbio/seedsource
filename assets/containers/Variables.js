import { connect } from 'react-redux'
import Variables from '../componenets/Variables'
import { variables as allVariables } from '../config'
import { addVariable, fetchValue } from '../actions/variables'
import { setError } from '../actions/error'

const mapStateToProps = state => {
    let variables = state.runConfiguration.variables
    let names = variables.map(item => item.name)
    let unusedVariables = allVariables.filter(item => !names.includes(item.name))

    return {variables, unusedVariables}
}

const mapDispatchToProps = dispatch => {
    return {
        onChange: (variable, variables) => {
            if (variables.length >= 6) {
                dispatch(setError(
                    'Configuration error', 'You may only add 6 variables to your configuration. Please remove an ' +
                    'exiting variable before adding another.'
                ))

                return
            }

            dispatch(addVariable(variable))
            dispatch(fetchValue(variable))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Variables)
