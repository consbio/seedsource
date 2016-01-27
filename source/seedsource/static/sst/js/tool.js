var SST = {
    variables: [
        'AHM', 'bFFP', 'CMD', 'DD_0', 'DD5', 'DD18', 'eFFP', 'EMT', 'Eref', 'EXT', 'FFP', 'MAP', 'MAR', 'MAT', 'MCMT',
        'MSP', 'MWMT', 'NFFD', 'PAS', 'RH', 'SHM', 'TD'
    ],

    labels: {
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
    },

    species: {
        species_1: ['AHM', 'bFFP', 'CMD'],
        species_2: ['MAR', 'MAP'],
        species_3: ['AHM', 'PAS', 'TD', 'MWMT']
    },

    values: {},

    isLoggedIn: false,
    email: null,
    selectedSpecies: 'species_1',
    map: null,
    pointMarker: null,
    resultsMapLayer: null,
    variableMapLayer: null,
    variablesList: null,

    point: null,
    objective: 'seedlots',
    time: 'current',
    RCP: 'rcp_1'
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
        layers: [L.tileLayer('//{s}.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
            maxZoom: 16,
            subdomains: ['server', 'services']
        })],
        zoom: 8,
        center: [49.67, -109.95]
    });
    SST.map.zoomControl.setPosition('topright');

    SST.map.on('click', function (e) {
        SST.point = {x: e.latlng.lng, y: e.latlng.lat};
        $('#LatInput').val(e.latlng.lat.toFixed(2));
        $('#LonInput').val(e.latlng.lng.toFixed(2));

        resetMapPoint();
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
            return 'service://west1_1981_2010Y_' + item.variable + ':' + item.variable;
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
                SST.resultsMapLayer = L.tileLayer(layerUrl, {zIndex: 2}).addTo(SST.map);
            }

            SST.variablesList.blur();
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

function resetMapPoint() {
    SST.values = {};
    SST.variablesList.forceUpdate();

    if (SST.pointMarker !== null) {
        SST.map.removeLayer(SST.pointMarker);
    }

    SST.pointMarker = L.marker([SST.point.y, SST.point.x]).addTo(SST.map);
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
});

$('#TimeSelect').change(function(e) {
    var time = e.target.value;
    SST.time = time;

    if (time === 'current') {
        $('#RCPSelect').addClass('hidden');
    }
    else {
        $('#RCPSelect').removeClass('hidden');
    }
});

$('#RCPSelect').change(function(e) {
    SST.RCP = e.target.value;
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
