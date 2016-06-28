import React, { PropTypes } from 'react'
import { Modal } from 'react-bootstrap'

const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November',
    'December'
];

class SaveModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {overwrite: false, title: ''}
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.showModal && !this.props.showModal) {
            let today = new Date()
            let title = 'Saved run - ' + months[today.getMonth()] + ' ' + today.getDate() + ', ' + today.getFullYear()

            this.setState({overwrite: false, title: title})
        }
    }

    render() {
        let { showModal, lastSave, runConfiguration, onHide, onSave, onUpdate } = this.props
        let body

        if (lastSave === null || this.state.overwrite) {
            body = (
                <form
                    onSubmit={e => {
                        e.preventDefault()

                        if (this.state.title) {
                            onSave(runConfiguration, this.state.title)
                        }
                    }}
                >
                    <label className="control-label">Title</label>
                    <input
                        type="text"
                        className="form-control"
                        value={this.state.title}
                        required
                        onChange={e => {
                            this.setState({title: e.target.value})
                        }}
                    />
                    <div>&nbsp;</div>
                    <button className="btn btn-lg btn-primary btn-block" type="submit">Save</button>
                </form>
            )
        }
        else {
            body = (
                <div>
                    <div>
                        Do you want to update the current configuration,
                        <strong>{lastSave.title}</strong>, or save as a new configuration?
                    </div>
                    <div>&nbsp;</div>
                    <div>
                        <button
                            className="btn btn-default pull-left"
                            onClick={() => {
                                this.setState({overwrite: true})
                            }}
                        >
                            Save as new
                        </button>

                        <button
                            className="btn btn-primary pull-right"
                            onClick={() => {
                                onUpdate(runConfiguration, lastSave)
                            }}
                        >
                            Update current
                        </button>
                    </div>
                    <div style={{clear: 'both'}}></div>
                </div>
            )
        }

        return (
            <Modal 
                show={showModal}
                bsSize="sm"
                onHide={e => {
                    onHide()
                }}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Save Run Configuration</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {body}
                </Modal.Body>
            </Modal>
        )
    }
}

SaveModal.propTypes = {
    showModal: PropTypes.bool.isRequired,
    lastSave: PropTypes.object,
    runConfiguration: PropTypes.object.isRequired,
    onHide: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired
}

export default SaveModal
