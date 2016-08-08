import React, { PropTypes } from 'react'
import { Modal } from 'react-bootstrap'

const ErrorModal = ({ show, title, message, debugInfo, onHide }) => {
    if (!show) {
        return null
    }

    let debug = null

    if (debugInfo !== null) {
        debug = (
            <div>
                <p>
                    If the problem persists, please <a href="https://github.com/consbio/seedsource/issues" target="_blank">
                    report an issue</a> and include the following information:
                </p>
                <pre  className="error-debug-info">{debugInfo}</pre>
            </div>
        )
    }

    return (
        <Modal show={true} onHide={() => onHide()}>
            <Modal.Header closeButton>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{message}</p>
                    {debug}
                </Modal.Body>
        </Modal>
    )
}

ErrorModal.propTypes = {
    show: PropTypes.bool.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    debugInfo: PropTypes.string,
    onHide: PropTypes.func.isRequired
}

export default ErrorModal
