import { connect } from 'react-redux'
import ClimateStep from '../componenets/ClimateStep'
import { selectClimateYear, selectClimateModel } from '../actions/climate'

const mapStateToProps = ({ runConfiguration }) => {
    let { climate } = runConfiguration

    return {climate}
}

const mapDispatchToProps = (dispatch) => {
    return {
        onChange: (type, value, climate) => {
            switch(type) {
                case 'year':
                    dispatch(selectClimateYear(value, climate))
                    break
                case 'model':
                    dispatch(selectClimateModel(value, climate))
                    break
            }
        }
    }
}

let container = connect(mapStateToProps, mapDispatchToProps)(ClimateStep)

container.shouldRender = () => true

export default container
