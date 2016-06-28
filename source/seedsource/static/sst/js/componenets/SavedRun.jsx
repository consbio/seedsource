import { PropTypes } from 'react'

const SavedRun = ({ active, save, onClick, onLoad, onDelete }) => {
    let className = 'configurationItem'
    let { modified, title } = save

    if (active) {
        className += ' focused'
    }

    return (
        <div
            className={className}
            onClick={() => {
                onClick()
            }}
        >
            <div className="pull-right buttons">
                <button
                    onClick={() => {
                        onLoad(save)
                    }}
                >
                    <span className="glyphicon glyphicon-open" aria-hidden="true"></span> Load
                </button>
                <button
                    onClick={() => {
                        onDelete(save.uuid)
                    }}
                >
                    <span className="glyphicon glyphicon-trash" aria-hidden="true"></span> Delete
                </button>
            </div>
            <div className="title">{title}</div>
            <div className="date">
                Last modified: {modified.getMonth()+1}/{modified.getDate()}/{modified.getYear()}
            </div>
            <div style={{clear: 'both'}}></div>
        </div>
    )
}

SavedRun.propTypes = {
    active: PropTypes.bool.isRequired,
    save: PropTypes.object.isRequired,
    onClick: PropTypes.func.isRequired,
    onLoad: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
}

export default SavedRun
