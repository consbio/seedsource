var SST = {
    isLoggedIn: false,
    email: null,
    reduxStore: null
}

function checkLogin() {
    $.get('/accounts/user-info/').success(function(data) {
        loggedIn(data.email);
    }).error(loggedOut);
}

function loggedIn(userEmail) {
    SST.isLoggedIn = true;
    SST.email = userEmail;
    SST.reduxStore.dispatch({'type': 'LOGIN'});

    var emailLabel = userEmail;
    if (emailLabel.length > 16) {
        emailLabel = emailLabel.substr(0, 13) + '...';
    }

    $('#EmailDisplay').html(emailLabel);
    $('#SignedInNav').removeClass('hidden');
    $('#SignedOutNav').addClass('hidden');
}

function loggedOut() {
    SST.isLoggedIn = false;
    SST.email = null;
    SST.reduxStore.dispatch({'type': 'LOGOUT'});

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

function resetPassword() {
    $('#ForgotPasswordModal .alert').addClass('hidden');

    var email = $('#ResetEmail').val();
    var data = {
        email: email
    };

    $('#ForgotPasswordModal button[type=submit]').prop('disabled', true);

    $.ajax({
        type: 'POST',
        url: '/accounts/lost-password/',
        data: data
    }).success(function() {
        $('#ForgotPasswordModal .alert-success').removeClass('hidden');
        $('#ForgotPasswordModal form').addClass('hidden');
    }).error(function(err) {
        if (err.responseJSON && err.responseJSON.email) {
            $('#ForgotPasswordModal .alert-danger').html(err.responseJSON.email.join("<br />"));
        }
        else {
            $('#ForgotPasswordModal .alert-danger').html('Sorry, there was an error.');
        }

        $('#ForgotPasswordModal .alert-danger').removeClass('hidden');
        $('#ForgotPasswordModal button').prop('disabled', false);
    });
}

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

$('#ForgotPasswordModal').on('hide.bs.modal', function() {
    $('#ForgotPasswordModal .alert').addClass('hidden');
    $('#ForgotPasswordModal form').removeClass('hidden');
    $('#ForgotPasswordModal button').prop('disabled', false);
});

$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        xhr.setRequestHeader("X-CSRFToken", $.cookie('csrftoken'));
    }
});

$(document).ready(checkLogin);
