var VariableConfig = React.createClass({
    getInitialState: function() {
        return {
            focused: false,
            identifyXhr: null
        };
    },

    focus: function() {
        if (!this.state.focused) {
            this.setState({focused: true});

            var layerUrl = '/tiles/1961_1990Y_' + this.props.variable.variable + '/{z}/{x}/{y}.png';
            if (variableMapLayer) {
                variableMapLayer.setUrl(layerUrl);
            }
            else {
                variableMapLayer = L.tileLayer(layerUrl, {zIndex: 1}).addTo(map);
            }
            variableMapLayer.listIndex = this.props.index;
        }
    },

    blur: function() {
        if (this.state.focused) {
            this.setState({focused: false});
        }

        if (variableMapLayer && variableMapLayer.listIndex == this.props.index) {
            map.removeLayer(variableMapLayer);
            variableMapLayer = null;
        }
    },

    handleClick: function(e) {
        if (e.target == this.refs.input) {
            return;
        }

        if (this.state.focused) {
            this.blur();
            this.props.onBlur(this);
        }
        else {
            this.focus();
            this.props.onFocus(this);
        }
    },

    handleInput: function(e) {
        this.props.variable.transfer = e.target.value;
        this.props.onTransferChange(e.target.value);
    },

    handleKey: function(e) {
        if (e.key == 'Enter') {
            this.blur();
            this.props.onBlur(this);
        }
    },

    handleRemove: function(e) {
        this.blur();
        this.props.onRemove(this);
        e.stopPropagation();
    },

    componentDidUpdate: function() {
        if (this.state.focused && ReactDOM.findDOMNode(this.refs.input) != document.activeElement) {
            ReactDOM.findDOMNode(this.refs.input).select();
        }
    },

    componentDidMount: function() {
        if (this.props.variable.autofocus) {
            this.focus();
            this.props.onFocus(this);
            this.props.variable.autofocus = false;
        }
    },

    render: function() {
        var valueNode = <span>Value: N/A</span>;
        var transferNode;

        if (point) {
            if (this.props.variable.variable in values) {
                var value = values[this.props.variable.variable];
                valueNode = <span>Value: {value === null ? 'N/A' : value}</span>;
            }
            else {
                var url = '/arcgis/rest/services/1961_1990Y_' + this.props.variable.variable + '/MapServer/identify/';
                var geometry = point;
                url += '?f=json&tolerance=2&imageDisplay=1600%2C1031%2C96&&geometryType=esriGeometryPoint&' +
                        'mapExtent=-12301562.058352625%2C6293904.1727356175%2C-12056963.567839967%2C6451517.325059711' +
                        '&geometry=' + JSON.stringify(geometry);

                if (this.state.identifyXhr !== null) {
                    this.state.identifyXhr.abort();
                }

                this.state.identifyXhr = $.get(url).success(function(data) {
                    var value;

                    if (data.results[0]) {
                        value = data.results[0].attributes['Pixel value'];
                    }
                    else {
                        value = null;
                    }

                    values[this.props.variable.variable] = value;
                    this.forceUpdate();
                    this.props.onValueUpdate(value);
                }.bind(this)).complete(function() {
                    this.state.identifyXhr = null;
                }.bind(this));
            }
        }

        if (this.state.focused) {
            transferNode = <input
                onChange={this.handleInput}
                ref="input"
                type="text"
                value={this.props.variable.transfer}
                className="form-control form"
            />
        }
        else {
            transferNode = <span>{this.props.variable.transfer}</span>
        }

        var className = "variableConfig";
        if (this.state.focused) {
            className += " focused";
        }

        return <div onClick={this.handleClick} onKeyPress={this.handleKey} className={className}>
            <button type="button" className="close" onClick={this.handleRemove}><span aria-hidden="true">&times;</span></button>
            <div>
                <div>
                    <strong>{labels[this.props.variable.variable]}</strong>
                </div>
            </div>
            <table>
                <tr>
                    <td>{valueNode}</td>
                    <td className="right">Transfer limit (+/-): {transferNode}</td>
                </tr>
            </table>
        </div>;
    }
});

var VariablesList = React.createClass({
    getInitialState: function() {
        return {
            variables: [],
            focusedConfig: null
        };
    },

    addVariable: function(variable, transfer, autofocus) {
        if (!variable) {
            variable = variables[0];
        }
        if (!transfer) {
            transfer = 2;
        }
        if (!autofocus) {
            autofocus = false;
        }

        this.state.variables.push({'variable': variable, 'transfer': transfer, 'autofocus': autofocus});
        this.forceUpdate();
    },

    clearVariables: function() {
        this.setState({variables: []});
    },

    handleTransferChange: function() {
        this.forceUpdate();
    },

    getConfiguration: function() {
        return this.state.variables.map(function(variable) {
            var item = {'variable': variable.variable, min: null, max: null};

            if (variable.variable in values) {
                var value = values[variable.variable];
                var transfer = parseFloat(variable.transfer);
                if (value === null) {
                    item.min = null;
                    item.max = null;
                }
                else {
                    item.min = value - transfer;
                    item.max = value + transfer;
                }
            }

            return item;
        });
    },

    blur: function() {
        if (this.state.focusedConfig) {
            this.state.focusedConfig.blur();
            this.state.focusedConfig = null;
        }
    },

    componentDidUpdate: function() {
        this.handleUpdate();
    },

    handleUpdate: function() {
        var disabled = true;

        if (point) {
            disabled = !this.getConfiguration().every(function(item) {
                var validMin = !isNaN(item.min) && item.min !== null;
                var validMax = !isNaN(item.max) && item.max !== null;

                return validMin && validMax;
            });
        }

        $('#RunButton').prop('disabled', disabled);
    },

    handleVariableSelect: function(e) {
        if (e.target.value) {
            this.addVariable(e.target.value, null, true);
            e.target.value = '';
        }
    },

    handleRemove: function(variableConfig) {
        this.state.variables.splice(variableConfig.props.index, 1);
        this.forceUpdate();
    },

    handleFocus: function(variableConfig) {
        if (this.state.focusedConfig) {
            this.state.focusedConfig.blur();
        }
        this.state.focusedConfig = variableConfig;
    },

    handleBlur: function() {
        this.state.focusedConfig = null;
    },

    render: function() {
        var rows = [];
        this.state.variables.forEach(function(variable, i) {
            rows.push(
                <VariableConfig
                    onTransferChange={this.handleTransferChange}
                    onValueUpdate={this.handleUpdate}
                    onRemove={this.handleRemove}
                    onFocus={this.handleFocus}
                    onBlur={this.handleBlur}
                    variable={variable}
                    index={i}
                />
            );
        }.bind(this));

        var availableVariables = [];
        variables.forEach(function(variable) {
            var variableInList = this.state.variables.some(function(item) {
                return item.variable == variable;
            });

            if (!variableInList) {
                availableVariables.push(
                    <option value={variable}>{labels[variable]}</option>
                );
            }
        }.bind(this));

        return <div className="variablesList">
            <div>
                {rows}
            </div>
            <div>
                <select ref="select" className="form-control" onChange={this.handleVariableSelect}>
                    <option value="" selected>Add a variable...</option>
                    {availableVariables}
                </select>
            </div>
        </div>
    }
});

variablesList = ReactDOM.render(
    <VariablesList />,
    $('#Variables')[0]
);

setSpecies('species_1');
