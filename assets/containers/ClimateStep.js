import { connect } from 'react-redux'
import ClimateStep from '../componenets/ClimateStep'
import { selectClimateYear, selectClimateModel } from '../actions/climate'

const mapStateToProps = ({ runConfiguration }) => {
    return {
        year: runConfiguration.time,
        model: runConfiguration.model
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onChange: (type, value) => {
            switch(type) {
                case 'year':
                    dispatch(selectClimateYear(value))
                    break
                case 'model':
                    dispatch(selectClimateModel(value))
                    break
            }
        }
    }
}

let container = connect(mapStateToProps, mapDispatchToProps)(ClimateStep)

container.shouldRender = () => true

export default container
