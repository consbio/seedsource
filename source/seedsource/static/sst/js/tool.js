var SST = {
    variables: [
        'MAT', 'MWMT', 'MCMT', 'TD', 'MAP', 'MSP', 'AHM', 'SHM', 'DD_0', 'FFP', 'PAS', 'EMT', 'EXT', 'Eref', 'CMD'
    ],

    labels: {
        MAT: 'Mean annual temperature (°C)',
        MWMT: 'Mean warmest month temperature (°C)',
        MCMT: 'Mean coldest month temperature (°C)',
        TD: 'Temperature difference between MWMT and MCMT, or continentality (°C)',
        MAP: 'Mean annual precipitation (mm)',
        MSP: 'May to September precipitation (mm)',
        AHM: 'Annual heat­moisture index',
        SHM: 'Summer heat­moisture index',
        DD_0: 'Degree­days below 0°C, chilling degree­days',
        FFP: 'Frost­free period',
        PAS: 'Precipitation as snow (mm) between August in previous year and July in current year',
        EMT: 'Extreme minimum temperature over 30 years',
        EXT: 'Extreme maximum temperature over 30 years',
        Eref: 'Hargreaves reference evaporation (mm)',
        CMD: 'Hargreaves climatic moisture deficit (mm)'
    },

    species: {
        species_1: ['MAT', 'MWMT', 'MCMT'],
        species_2: ['TD', 'MSP'],
        species_3: ['MAT', 'PAS', 'TD', 'MWMT']
    },

    values: {},

    isLoggedIn: false,
    email: null,
    selectedSpecies: 'species_1',
    map: null,
    layerOpacity: 1,
    pointMarker: null,
    resultsMapLayer: null,
    variableMapLayer: null,
    variablesList: null,
    selectedVariable: null,
    visibilityButton: null,
    configurationsList: null,

    point: null,
    objective: 'seedlots',
    region: 'west1',
    time: '1961_1990',
    RCP: 'rcp45',

    lastRunConfiguration: null,
    lastSave: null
};

function checkLogin() {
    $.get('/accounts/user-info/').success(function(data) {
        loggedIn(data.email);
    }).error(loggedOut);
}

function loggedIn(userEmail) {
    SST.isLoggedIn = true;
    SST.email = userEmail;

    $('#EmailDisplay').html(userEmail);
    $('#SignedInNav').removeClass('hidden');
    $('#SignedOutNav').addClass('hidden');
}

function loggedOut() {
    SST.isLoggedIn = false;
    SST.email = null;

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
    SST.map = L.map('Map', {
        zoom: 5,
        center: [44.68, -109.36]
    });
    SST.map.zoomControl.setPosition('topright');

    SST.map.addControl(L.control.basemaps({
        basemaps: [
            L.tileLayer('//{s}.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
                maxZoom: 16,
                subdomains: ['server', 'services']
            }),
            L.tileLayer(
                '//{s}.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
                maxZoom: 16,
                subdomains: ['server', 'services']
            }),
            L.tileLayer(
                '//{s}.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
                maxZoom: 16,
                subdomains: ['server', 'services']
            })
        ],
        tileX: 0,
        tileY: 0,
        tileZ: 1,
        position: 'bottomleft'
    }));

    var opacityControl = L.control.opacity();
    SST.map.addControl(opacityControl);
    opacityControl.on('change', function(e) {
        SST.layerOpacity = e.value / 100;
        if (SST.variableMapLayer) {
            SST.variableMapLayer.setOpacity(SST.layerOpacity);
        }
        if (SST.resultsMapLayer) {
            SST.resultsMapLayer.setOpacity(SST.layerOpacity);
        }
    });

    SST.visibilityButton = L.control.button({'icon': 'eye-close'});
    SST.visibilityButton.on('click', function(e) {
        if (e.target.options.icon === 'eye-close') {
            e.target.setIcon('eye-open');

            if (SST.resultsMapLayer) {
                SST.map.removeLayer(SST.resultsMapLayer);
            }
        }
        else {
            e.target.setIcon('eye-close');

            if (SST.resultsMapLayer) {
                SST.map.addLayer(SST.resultsMapLayer);
            }
        }
    });

    SST.map.on('click', function (e) {
        SST.point = {x: e.latlng.lng, y: e.latlng.lat};
        $('#LatInput').val(e.latlng.lat.toFixed(2));
        $('#LonInput').val(e.latlng.lng.toFixed(2));

        resetMapPoint();
    });
}

function loadConfigurations() {
    $.get('/sst/run-configurations/').done(function (data) {
        data.forEach(function (item) {
            item.configuration = JSON.parse(item.configuration);
            item.created = new Date(item.created);
            item.modified = new Date(item.modified);
        });

        SST.configurationsList.setState({configurations: data});
    });
}

function setSpecies(id) {
    SST.variablesList.clearVariables();

    SST.species[id].forEach(function(variable) {
        SST.variablesList.addVariable(variable);
    });
}

function showJobOverlay() {
    $('#JobStatusOverlay').removeClass('hidden');
}

function hideJobOverlay() {
    $('#JobStatusOverlay').addClass('hidden');
}

function runJob() {
    var configuration = SST.variablesList.getConfiguration();
    var inputs = {
        variables: configuration.map(function(item) {
            /* Run the tool against the current time period when looking for seedlots, against the target time period
             * when looking for planting sites. */
            var year = '1961_1990';
            if (SST.objective === 'site' && SST.time !== '1961_1990') {
                year = SST.RCP + '_' + SST.time;
            }

            return 'service://west1_' + year + 'Y_' + item.variable + ':' + item.variable;
        }),
        limits: configuration.map(function(item) {
            return {min: item.min, max: item.max};
        })
    };

    var url = '/geoprocessing/rest/jobs/';
    var data = {
        job: 'generate_scores',
        inputs: JSON.stringify(inputs)
    };
    $.post(url, data).done(function(data) {
        pollJobStatus(data.uuid);
    }).fail(function() {
        alert('Sorry, there was an error running the job. Please try again.');
        hideJobOverlay();
    });

    showJobOverlay();

    SST.lastRunConfiguration = {
        objective: SST.objective,
        point: SST.point,
        region: SST.region,
        time: SST.time,
        model: SST.RCP,
        species: SST.selectedSpecies,
        variables: SST.variablesList.getConfiguration().map(function(item) {
            return {
                variable: item.variable,
                value: SST.values[item.variable],
                min: item.min,
                max: item.max
            };
        })
    };

    $('#SaveButton, #ExportButton').attr('disabled', true);
}

function pollJobStatus(uuid) {
    $.get('/geoprocessing/rest/jobs/' + uuid + '/').done(function(data) {
        if (data.status === 'success') {
            hideJobOverlay();
            var layerUrl = '/tiles/' + JSON.parse(data.outputs).raster_out + '/{z}/{x}/{y}.png';

            if (SST.resultsMapLayer) {
                SST.resultsMapLayer.setUrl(layerUrl);
            }
            else {
                SST.resultsMapLayer = L.tileLayer(layerUrl, {zIndex: 2, opacity: SST.layerOpacity}).addTo(SST.map);
            }

            SST.variablesList.blur();
            SST.map.addControl(SST.visibilityButton);
            
            $('#SaveButton, #ExportButton').removeAttr('disabled');
        }
        else if (data.status === 'pending' || data.status == 'started') {
            setTimeout(function() { pollJobStatus(uuid); }, 1000);
        }
        else {
            alert('Sorry, there was an error running the job. Please try again.');
            hideJobOverlay();
        }
    }).fail(function() {
        alert('Sorry, there was an error running the job. Please try again.');
        hideJobOverlay();
    });
}

function handleSave() {
    if (SST.lastSave) {
        $('#CurrentSaveTitle').html(SST.lastSave.title);
        $('#OverwriteModal').modal('show');
        $('#OverwriteModal button').removeAttr('disabled');
    }
    else {
        showSaveDialog();
    }
}

function showSaveDialog() {
    var months = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November',
        'December'
    ];
    var today = new Date();
    var title = 'Saved run - ' + months[today.getMonth()] + ' ' + today.getDate() + ', ' + today.getFullYear();

    $('#RunTitle').val(title);
    $('#SaveModal').modal('show');
    $('#OverwriteModal').modal('hide');
}

function saveConfiguration() {
    var data = {
        title: $('#RunTitle').val(),
        configuration: JSON.stringify(SST.lastRunConfiguration)
    };

    $.post('/sst/run-configurations/', data).done(function(data) {
        SST.lastSave = data;

        $('#SaveModal button').removeAttr('disabled');
        $('#SaveModal').modal('hide');
        $('#SaveButton').attr('disabled', true);

        loadConfigurations();
    });

    $('#SaveModal button').attr('disabled', true);
}

function updateConfiguration() {
    var data = {
        title: SST.lastSave.title,
        configuration: JSON.stringify(SST.lastRunConfiguration)
    };

    $.ajax({
        type: 'PUT',
        url: '/sst/run-configurations/' + SST.lastSave.uuid,
        data: data,
        success: function (data) {
            SST.lastSave = data;

            $('#OverwriteModal').modal('hide');
            $('#SaveButton').attr('disabled', true);

            loadConfigurations();
        }
    });

    $('#OverwriteModal button').attr('disabled', true);
}

function loadConfiguration(configuration) {
    if (!confirm('Load this saved configuration? This will replace your current settings.')) {
        return;
    }

    resetConfiguration();

    var config = configuration.configuration;

    if (config.objective !== 'seedlots') {
        $('input[name=objective][value=site]').click();
    }

    SST.point = config.point;
    SST.objective = config.objective;
    SST.region = config.region;
    SST.time = config.time;
    SST.RCP = config.model;
    SST.lastSave = configuration;

    resetMapPoint();

    $('#LatInput').val(config.point.y.toFixed(2));
    $('#LonInput').val(config.point.x.toFixed(2));
    $('#RegionSelect').val(config.region);
    $('#TimeSelect').val(config.time);
    $('#RCPSelect').val(config.model);
    $('#SpeciesSelect').val(config.species);

    if (config.time !== '1961_1990') {
        $('#RCPSelect').removeClass('hidden');
    }

    SST.variablesList.setState({
        variables: config.variables.map(function(variable) {
            SST.values[variable.variable] = variable.value;
            return {'variable': variable.variable, 'transfer': variable.max - variable.value, 'autofocus': false};
        })
    });

    SST.variablesList.setState({variable: []});

    $('#RunButton').removeAttr('disabled');
    
    $('a[href=#ToolTab]').tab('show');
}

function deleteConfiguration(configuration) {
    if (!confirm('Delete this saved configuration?')) {
        return;
    }

    $.ajax({
        type: 'DELETE',
        url: '/sst/run-configurations/' + configuration.uuid,
        success: function() {
            loadConfigurations();
        }
    });

    if (configuration.uuid == SST.lastSave.uuid) {
        SST.lastSave = null;
    }
}

function resetConfiguration() {
    if (SST.variableMapLayer) {
        SST.map.removeLayer(SST.variableMapLayer);
    }
    if (SST.resultsMapLayer) {
        SST.map.removeLayer(SST.resultsMapLayer);
    }
    if (SST.pointMarker) {
        SST.map.removeLayer(SST.pointMarker);
    }

    SST.map.removeControl(SST.visibilityButton);

    SST.selectedSpecies = 'species_1';
    SST.pointMarker = null;
    SST.resultsMapLayer = null;
    SST.variableMapLayer = null;
    SST.selectedVariable = null;

    SST.point = null;
    SST.objective = 'seedlots';
    SST.region = 'west1';
    SST.time = '1961_1990';
    SST.RCP = 'rcp45';

    SST.lastRunConfiguration = null;
    SST.lastSave = null;

    $('input[name=objective][value=seedlots]').click();
    $('#LatInput, #LonInput').val('');
    $('#RegionSelect').val('west1');
    $('#TimeSelect').val('1961_1990');
    $('#RCPSelect').val('rcp45').addClass('hidden');
    $('#SpeciesSelect').val('species_1');

    SST.variablesList.clearVariables();

    $('#RunButton').attr('disabled', true);
    $('#SaveButton').attr('disabled', true);
    $('#ExportButton').attr('disabled', true);
}

function resetMapPoint() {
    SST.values = {};
    SST.variablesList.forceUpdate();

    if (SST.pointMarker !== null) {
        SST.map.removeLayer(SST.pointMarker);
    }

    SST.pointMarker = L.marker([SST.point.y, SST.point.x]).addTo(SST.map);
}

function getServiceName(variable) {
    var serviceName = 'west1_';

    if (SST.objective === 'site') {
        return serviceName + '1961_1990Y_' + variable;
    }
    else {
        if (SST.time !== '1961_1990') { // "Current" time period
            serviceName += SST.RCP + '_';
        }

        return serviceName + SST.time + 'Y_' + variable;
    }
}

function resetMapLayer() {
    if (SST.variableMapLayer) {
        SST.variableMapLayer.setUrl('/tiles/' + getServiceName(SST.selectedVariable) + '/{z}/{x}/{y}.png');
    }

    SST.values = {};
    SST.variablesList.forceUpdate();
}

function resetTimeLabel() {
    var label;

    if (SST.objective === 'site') {
        label = '1961 - 1990';
    }
    else {
        var label = SST.time.replace('_', ' - ');

        if (SST.time !== '1961_1990') {
            label += ' ' + $('option[value=' + SST.RCP + ']').html();
        }
    }

    $('#TimeLabel').html(label);
}

$('.coords input').keypress(function(e) {
    if (e.keyCode === 13) {
        e.target.blur();
    }
});

$('.coords input').blur(function(e) {
    var value = parseFloat(e.target.value);
    var changed = false;

    if (e.target.id === 'LatInput' && value !== SST.point.y) {
        SST.point.y = value;
        changed = true;
    }
    else if (e.target.id === 'LonInput' && value !== SST.point.x) {
        SST.point.x = value;
        changed = true;
    }

    if (changed) {
        resetMapPoint();
    }
});

$('input[name=objective]').change(function(e) {
    var objective = e.target.value;
    SST.objective = objective;

    if (objective === 'seedlots') {
        $('#SelectPointLabel').html('Select a planting site');
    }
    else {
        $('#SelectPointLabel').html('Select a seedlot location');
    }

    resetMapLayer();
    resetTimeLabel();
});

$('#RegionSelect').change(function(e) {
    SST.region = e.target.value;
});

$('#TimeSelect').change(function(e) {
    var time = e.target.value;
    SST.time = time;

    if (time === '1961_1990') {  // "Current" time period
        $('#RCPSelect').addClass('hidden');
    }
    else {
        $('#RCPSelect').removeClass('hidden');
    }

    resetMapLayer();
    resetTimeLabel();
});

$('#RCPSelect').change(function(e) {
    SST.RCP = e.target.value;
    resetMapLayer();
    resetTimeLabel();
});

$('#SpeciesSelect').change(function(e) {
    if (SST.variablesList.state.isDirty) {
        var message = 'Do you want pick a new species? This will overwrite your current variable configuration.';
        if (!confirm(message)) {
            e.target.value = SST.selectedSpecies;
            return;
        }
    }

    setSpecies(e.target.value);
    SST.selectedSpecies = e.target.value;
});

$('#SaveModal').on('shown.bs.modal', function(e) {
     e.stopImmediatePropagation();
    $('#RunTitle').select();
 });

$('.modal').on('shown.bs.modal', function() {
    $('.modal .alert').addClass('hidden');
    $(this).find('input').val('');
    $(this).find('input[type=text]:first, input[type=email]:first').focus();
});

$('#InfoModal').on('show.bs.modal', function(event) {
    var button = $(event.relatedTarget);
    $('#InfoModal .modal-title').html(button.data('title'));
    $('#InfoModal .modal-body').addClass('hidden');
    $(button.data('content')).removeClass('hidden');
});

$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        xhr.setRequestHeader("X-CSRFToken", $.cookie('csrftoken'));
    }
});

initMap();
checkLogin();
