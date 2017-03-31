import React, { PropTypes } from 'react'
import ConfigurationStep from '../containers/ConfigurationStep'
import SaveModal from '../containers/SaveModal'
import { reports } from '../config'

const RunStep = ({ number, configuration, canRun, canSave, isLoggedIn, reportIsFetching, onRun, onSave, onExport }) => {
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
                    <div className="dropup pull-right">
                        <button
                            className="btn btn-secondary dropdown-toggle"
                            type="button"
                            id="reportMenuButton"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                            disabled={!canSave || reportIsFetching}
                        >
                            <span className="icon12 icon-file" aria-hidden="true"></span>
                            {reportIsFetching ? 'Please wait...' : 'Export As...'} &nbsp;
                            <b className="caret"></b>
                        </button>
                        <ul className="dropdown-menu dropdown-menu-right" aria-labelledby="reportMenuButton">
                            {reports.map(r => (
                                <li key={r.name}>
                                <a className="dropdown-item" href="#"
                                   id={r.name}
                                   onClick={e => {
                                       e.preventDefault()
                                       onExport(e.target.id)
                                   }}>{r.label}</a></li>))}
                        </ul>
                    </div>
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
    reportIsFetching: PropTypes.bool.isRequired,
    onRun: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onExport: PropTypes.func.isRequired
}

export default RunStep
