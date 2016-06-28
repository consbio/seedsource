import { connect } from 'react-redux'
import SaveModal from '../componenets/SaveModal'
import { hideSaveModal, createSave, updateSave } from '../actions/saves'

const mapStateToProps = ({ saves, runConfiguration }) => {
    let { showModal, lastSave, isSaving } = saves

    return {showModal, lastSave, isSaving, runConfiguration}
}

const mapDispatchToProps = dispatch => {
    return {
        onHide: () => {
            dispatch(hideSaveModal())
        },

        onSave: (configuration, title) => {
            dispatch(createSave(configuration, title))
        },

        onUpdate: (configuration, lastSave) => {
            dispatch(updateSave(configuration, lastSave))
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SaveModal)
