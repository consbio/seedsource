import React, { PropTypes } from 'react'
import ReactDOM from 'react-dom'

class EditableLabel extends React.Component {
    constructor(props) {
        super(props)
        this.state = {editValue: null, edit: false}
    }

    componentDidUpdate() {
        let inputNode = ReactDOM.findDOMNode(this.refs.valueInput)

        if (this.state.edit && inputNode !== document.activeElement) {
            inputNode.select()
        }
    }

    render() {
        let { editValue, edit } = this.state
        let { children, value, onChange } = this.props

        if (!edit) {
            return (
                <span className="editable-label" onClick={() => this.setState({edit: true})}>
                    {value}{children}
                </span>
            )
        }
        else {
            return (
                <div className="editable-label edit">
                    <input
                        ref="valueInput"
                        type="text"
                        data-lpignore="true"
                        className="form form-control form-inline"
                        value={editValue === null ? value : editValue}
                        onChange={e => {
                            this.setState({editValue: e.target.value})
                        }}
                        onBlur={e => {
                            if (parseFloat(e.target.value) !== parseFloat(value)) {
                                onChange(e.target.value)
                            }
                            this.setState({editValue: null, edit: false})
                        }}
                        onKeyUp={e => {
                            if (e.key === 'Enter') {
                                e.target.blur()
                            }
                            if (e.key === 'Escape') {
                                this.setState({editValue: null, edit: false})
                            }
                        }}
                    />{children}
                </div>
            )
        }
    }
}

EditableLabel.PropTypes = {
    value: PropTypes.number,
    onChange: PropTypes.func.isRequied
}

export default EditableLabel
