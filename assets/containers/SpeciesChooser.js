import { connect } from 'react-redux'
import SpeciesChooser from '../componenets/SpeciesChooser'
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

export default connect(mapStateToProps, mapDispatchToProps)(SpeciesChooser)
