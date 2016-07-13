import { connect } from 'react-redux'
import SpeciesStep from '../componenets/SpeciesStep'
import { selectSpecies } from '../actions/species'

const mapStateToProps = ({ runConfiguration }) => {
    let { method, species } = runConfiguration

    return {method, species}
}

const mapDispatchToProps = dispatch => {
    return {
        onSpeciesChange: species => {
            dispatch(selectSpecies(species))
        }
    }
}

let container = connect(mapStateToProps, mapDispatchToProps)(SpeciesStep)

container.shouldRender = state => state.runConfiguration.method === 'seedzone'

export default container
