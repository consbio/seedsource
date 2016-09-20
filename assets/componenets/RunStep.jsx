import React, { PropTypes } from 'react'
import ConfigurationStep from '../containers/ConfigurationStep'
import SaveModal from '../containers/SaveModal'

const RunStep = ({ number, configuration, canRun, canSave, isLoggedIn, pdfIsFetching, onRun, onSave, onPDF }) => {
    return (
        <ConfigurationStep title="Map your Results" number={number} name="run" active={false}>
            <div>
                <h4></h4>
                <button
                    className="btn btn-lg btn-primary btn-block"
                    disabled={!canRun}
                    onClick={e => {
                        onRun(configuration)
                    }}
                >
                    Run Tool
                </button>
            </div>
            <div>
                <h4></h4>
                <div>
                    <button
                        className="btn btn-default pull-left"
                        disabled={!canSave}
                        onClick={() => {
                            onSave(isLoggedIn)
                        }}
                    >
                        <span className="icon12 icon-save" aria-hidden="true"></span> Save Last Run
                    </button>
                    <button
                        className="btn btn-default pull-right"
                        disabled={!canSave || pdfIsFetching}
                        onClick={e => {
                            onPDF()
                        }}
                    >
                        <span className="icon12 icon-file" aria-hidden="true"></span>
                        {pdfIsFetching ? 'Please wait...' : 'Export PDF'}
                    </button>
                </div>
                <div style={{clear: 'both'}}></div>
            </div>

            <SaveModal />
        </ConfigurationStep>
    )
}

RunStep.propTypes = {
    number: PropTypes.number.isRequired,
    configuration: PropTypes.object.isRequired,
    canRun: PropTypes.bool.isRequired,
    canSave: PropTypes.bool.isRequired,
    isLoggedIn: PropTypes.bool.isRequired,
    pdfIsFetching: PropTypes.bool.isRequired,
    onRun: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onPDF: PropTypes.func.isRequired
}

export default RunStep
