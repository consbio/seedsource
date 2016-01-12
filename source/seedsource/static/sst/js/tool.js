var variables = [
    'AHM', 'bFFP', 'CMD', 'DD_0', 'DD5', 'DD18', 'eFFP', 'EMT', 'Eref', 'EXT', 'FFP', 'MAP', 'MAR', 'MAT', 'MCMT',
    'MSP', 'MWMT', 'NFFD', 'PAS', 'RH', 'SHM', 'TD'
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
var species = {
    species_1: ['AHM', 'bFFP', 'CMD'],
    species_2: ['MAR', 'MAP'],
    species_3: ['AHM', 'PAS', 'TD', 'MWMT']
};
var values = {};

var isLoggedIn = false;
var email = null;
var point = null;
var selectedSpecies = 'species_1';
var map;
var pointMarker = null;
var resultsMapLayer = null;
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
        point = {x: e.latlng.lng, y: e.latlng.lat};
        $('#LatInput').val(e.latlng.lat.toFixed(2));
        $('#LonInput').val(e.latlng.lng.toFixed(2));

        resetMapPoint();
    });
}

function setSpecies(id) {
    variablesList.clearVariables();

    species[id].forEach(function(variable) {
        variablesList.addVariable(variable);
    });
}

function showJobOverlay() {
    $('#JobStatusOverlay').removeClass('hidden');
}

function hideJobOverlay() {
    $('#JobStatusOverlay').addClass('hidden');
}

function runJob() {
    var configuration = variablesList.getConfiguration();
    var inputs = {
        variables: configuration.map(function(item) {
            return 'service://1961_1990Y_' + item.variable + ':' + item.variable;
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

            if (resultsMapLayer) {
                resultsMapLayer.setUrl(layerUrl);
            }
            else {
                resultsMapLayer = L.tileLayer(layerUrl, {zIndex: 2}).addTo(map);
            }

            variablesList.blur();
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
    values = {};
    variablesList.forceUpdate();

    if (pointMarker !== null) {
        map.removeLayer(pointMarker);
    }

    pointMarker = L.marker([point.y, point.x]).addTo(map);
}

$('.coords input').keypress(function(e) {
    if (e.keyCode === 13) {
        e.target.blur();
    }
});

$('.coords input').blur(function(e) {
    var value = parseFloat(e.target.value);
    var changed = false;

    if (e.target.id === 'LatInput' && value !== point.y) {
        point.y = value;
        changed = true;
    }
    else if (e.target.id === 'LonInput' && value !== point.x) {
        point.x = value;
        changed = true;
    }

    if (changed) {
        resetMapPoint();
    }
});

$('#SpeciesSelect').change(function(e) {
    if (variablesList.state.isDirty) {
        var message = 'Do you want pick a new species? This will overwrite your current variable configuration.';
        if (!confirm(message)) {
            e.target.value = selectedSpecies;
            return;
        }
    }

    setSpecies(e.target.value);
    selectedSpecies = e.target.value;
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
