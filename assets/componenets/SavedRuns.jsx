import React, { PropTypes } from 'react'
import SavedRun from '../containers/SavedRun'

class SavedRuns extends React.Component {
    constructor(props) {
        super(props)
        this.state = {activeSave: null}
    }

    componentDidMount() {
        this.props.onLoad()
    }

    render() {
        let { saves } = this.props
        let { activeSave } = this.state

        return (
            <div className="configurationList">
                {saves.map(item => {
                    return (
                        <SavedRun
                            key={item.uuid}
                            save={item}
                            active={activeSave === item.uuid}
                            onClick={() => {
                                this.setState({activeSave: item.uuid})
                            }}
                        />
                    )
                })}
            </div>
        )
    }
}

SavedRuns.propTypes = {
    saves: PropTypes.array.isRequired,
    onLoad: PropTypes.func.isRequired
}

export default SavedRuns
