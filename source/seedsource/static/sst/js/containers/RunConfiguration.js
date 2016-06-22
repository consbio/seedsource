import { connect } from 'react-redux'
import RunConfiguration from '../componenets/RunConfiguration'
import { selectSpecies } from '../actions/species'

const mapStateToProps = ({ runConfiguration }) => {
    return {
        objective: runConfiguration.objective,
        species: runConfiguration.species
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onSpeciesChange: species => {
            dispatch(selectSpecies(species))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RunConfiguration)
