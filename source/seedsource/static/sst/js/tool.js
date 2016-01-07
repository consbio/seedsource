var variables = [
    'AHM', 'bFFP', 'CMD', 'DD_0', 'DD5', 'DD18', 'eFFP', 'EMT', 'Eref', 'EXT', 'FFP', 'MAP', 'MAR', 'MAT',
    'MCMT', 'MSP', 'MWMT', 'NFFD', 'PAS', 'RH', 'SHM', 'TD'
];
var labels = {
    AHM: 'Annual heat­moisture index',
    bFFP: 'The day of the year on which FPP (frost-free period) begins',
    CMD: 'Hargreaves climatic moisture deficit (mm)',
    DD_0: 'Degree­days below 0°C, chilling degree­days',
    DD5: 'Degree­days above 5°C, growing degree­days',
    DD18: 'DD18',
    eFFP: 'The day of the year on which FFP (frost-free period) ends',
    EMT: 'Extreme minimum temperature over 30 years',
    Eref: 'Hargreaves reference evaporation (mm)',
    EXT: 'Extreme maximum temperature over 30 years',
    FFP: 'Frost­free period',
    MAP: 'Mean annual precipitation (mm)',
    MAR: 'Mean annual solar radiation (MJ m-2 d-1)',
    MAT: 'Mean annual temperature (°C)',
    MCMT: 'Mean coldest month temperature (°C)',
    MSP: 'May to September precipitation (mm)',
    MWMT: 'Mean warmest month temperature (°C)',
    NFFD: 'The number of frost­free days',
    PAS: 'Precipitation as snow (mm) between August in previous year and July in current year',
    RH: 'Mean annual relative humidity (%)',
    SHM: 'Summer heat­moisture index',
    TD: 'Temperature difference between MWMT and MCMT, or continentality (°C)'
};
var values = {};
var species = {
    species_1: ['AHM', 'bFFP', 'CMD'],
    species_2: ['MAR', 'MAP'],
    species_3: ['AHM', 'PAS', 'TD', 'MWMT']
};

var isLoggedIn = false;
var email = null;
var config = {
    point: null
};
var map;
var variableMapLayer;
var variablesList;

function checkLogin() {
    $.get('/accounts/user-info/').success(function(data) {
        loggedIn(data.email);
    }).error(loggedOut);
}

function loggedIn(userEmail) {
    isLoggedIn = true;
    email = userEmail;

    $('#EmailDisplay').html(userEmail);
    $('#SignedInNav').removeClass('hidden');
    $('#SignedOutNav').addClass('hidden');
}

function loggedOut() {
    isLoggedIn = false;
    email = null;

    $('#SignedInNav').addClass('hidden');
    $('#SignedOutNav').removeClass('hidden');
}

function login() {
    var data = {
        email: $('#LoginEmail').val(),
        password: $('#LoginPassword').val()
    };
    $.post('/accounts/login/', data).success(function() {
        $('#LoginModal').modal('hide');
        checkLogin();
    }).error(function() {
        $('#LoginModal .alert').removeClass('hidden');
    });
}

function logout() {
    $.get('/accounts/logout/').success(loggedOut);
}

function createAccount() {
    $('#RegisterModal .alert').addClass('hidden');

    var password = $('#RegisterPassword').val();
    var passwordConfirm = $('#RegisterPasswordConfirm').val();

    if (password !== passwordConfirm) {
        $('#RegisterModal .alert').html("Passwords don't match.").removeClass('hidden');
        return;
    }

    var data = {
        email: $('#RegisterEmail').val(),
        password: password
    };
    $.post('/accounts/create-account/', data).success(function() {
        $('#RegisterModal').modal('hide');
        checkLogin();
    }).error(function() {
        $('#RegisterModal .alert')
                .html('This email address is used by an existing account.')
                .removeClass('hidden');
    });
}

function changeEmail() {
    $('#SettingsModal .alert').addClass('hidden');

    var data = {
        email: $('#ChangeEmail').val()
    };
    $.ajax({
        type: 'PUT',
        url: '/accounts/change-email/',
        data: data
    }).success(function() {
        $('#SettingsModal').modal('hide');
        checkLogin();
    }).error(function() {
        $('#SettingsModal .alert.email')
                .html('This email address is used by an existing account.')
                .removeClass('hidden');
    });
}

function changePassword() {
    $('#SettingsModal .alert').addClass('hidden');

    var password = $('#ChangePassword').val();
    var passwordConfirm = $('#ChangePasswordConfirm').val();

    if (password !== passwordConfirm) {
        $('#SettingsModal .alert.password').html("Passwords don't match.").removeClass('hidden');
        return;
    }

    var data = {
        password: password
    };
    $.ajax({
        type: 'PUT',
        url: '/accounts/change-password/',
        data: data
    }).success(function() {
        $('#SettingsModal').modal('hide');
    });
}

function initMap() {
    map = L.map('Map', {
        layers: [L.tileLayer('//{s}.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
            maxZoom: 16,
            subdomains: ['server', 'services']
        })],
        zoom: 8,
        center: [49.67, -109.95]
    });
    map.zoomControl.setPosition('topright');

    map.on('click', function (e) {
        config.point = {x: e.latlng.lng, y: e.latlng.lat};
        $('#CoordsDisplay').html('Lat: ' + e.latlng.lat.toFixed(2) + ', Lon: ' + e.latlng.lng.toFixed(2));
        values = {};
        variablesList.forceUpdate();
    });
}

function setSpecies(id) {
    variablesList.clearVariables();

    species[id].forEach(function(variable) {
        variablesList.addVariable(variable);
    });
}

var VariableConfig = React.createClass({
    getInitialState: function() {
        return {
            focused: false
        };
    },

    handleFocus: function(e) {
        if (!this.state.focused) {
            this.setState({focused: true});

            setTimeout(function() {
                window.addEventListener('click', this.handleBlur);
            }.bind(this), 1);

            var layerUrl = '/tiles/1961_1990Y_' + this.props.variable.variable + '/{z}/{x}/{y}.png';
            if (variableMapLayer) {
                variableMapLayer.setUrl(layerUrl);
            }
            else {
                variableMapLayer = L.tileLayer(layerUrl).addTo(map);
            }
            variableMapLayer.listIndex = this.props.index;
        }
        else {
            e.stopPropagation();
        }
    },

    handleBlur: function(e) {
        // Ignore clicks on map
        if (e.target.className.indexOf('leaflet') >= 0) {
            return;
        }

        this.blur();
    },

    blur: function() {
        if (this.state.focused) {
            this.setState({focused: false});

            window.removeEventListener('click', this.handleBlur);
        }

        if (variableMapLayer && variableMapLayer.listIndex == this.props.index) {
            map.removeLayer(variableMapLayer);
            variableMapLayer = null;
        }
    },

    handleInput: function(e) {
        this.props.variable.transfer = e.target.value;
        this.props.onTransferChange(e.target.value);
    },

    handleKey: function(e) {
        if (e.key == 'Enter') {
            this.handleBlur(e);
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
            this.handleFocus();
            this.props.variable.autofocus = false;
        }
    },

    render: function() {
        var valueNode = <span>Value: N/A</span>;
        var transferNode;

        if (config.point) {
            if (this.props.variable.variable in values && values[this.props.variable.variable]) {
                valueNode = <span>Value: {values[this.props.variable.variable]}</span>;
            }
            else {
                var url = '/arcgis/rest/services/1961_1990Y_' + this.props.variable.variable + '/MapServer/identify/';
                var geometry = config.point;
                url += '?f=json&tolerance=2&imageDisplay=1600%2C1031%2C96&&geometryType=esriGeometryPoint&' +
                        'mapExtent=-12301562.058352625%2C6293904.1727356175%2C-12056963.567839967%2C6451517.325059711' +
                        '&geometry=' + JSON.stringify(geometry);

                $.get(url).success(function(data) {
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

        return <div onClick={this.handleFocus} onKeyPress={this.handleKey} className={className}>
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
            variables: []
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

    componentDidUpdate: function() {
        this.handleUpdate();
    },

    handleUpdate: function() {
        var disabled = true;

        if (config.point) {
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

    render: function() {
        var rows = [];
        this.state.variables.forEach(function(variable, i) {
            rows.push(
                <VariableConfig
                    onTransferChange={this.handleTransferChange}
                    onValueUpdate={this.handleUpdate}
                    onRemove={this.handleRemove}
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

var variablesList = ReactDOM.render(
    <VariablesList />,
    $('#Variables')[0]
);

$('#SpeciesSelect').change(function(e) {
    setSpecies(e.target.value);
});

$('.modal').on('shown.bs.modal', function() {
    $('.modal .alert').addClass('hidden');
    $(this).find('input').val('');
    $(this).find('input[type=text]:first, input[type=email]:first').focus();
});

$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        xhr.setRequestHeader("X-CSRFToken", $.cookie('csrftoken'));
    }
});

initMap();
checkLogin();
setSpecies('species_1');
