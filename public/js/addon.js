/* add-on script */

$(document).ready(function () {

  // Check the theme...
  var theme = getQueryVariable('theme');
  if (theme === 'light' || theme === 'dark') {
    $('body').addClass(theme);
  }

  // Utility functions...

  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      if (pair[0] == variable) {
        return pair[1];
      }
    }
    return false;
  }

  // The following functions use the HipChat Javascript API
  // https://developer.atlassian.com/hipchat/guide/javascript-api

  //To send a message to the HipChat room, you need to send a request to the add-on back-end
  function sayHello(callback) {
    //Ask HipChat for a JWT token
    HipChat.auth.withToken(function (err, token) {
      if (!err) {
        //Then, make an AJAX call to the add-on backend, including the JWT token
        //Server-side, the JWT token is validated using the middleware function addon.authenticate()
        $.ajax(
            {
              type: 'POST',
              url: '/send_notification',
              headers: {'Authorization': 'JWT ' + token},
              dataType: 'json',
              data: {messageTitle: 'Hello World!'},
              success: function () {
                callback(false);
              },
              error: function () {
                callback(true);
              }
            });
      }
    });
  }

  /* Functions used by sidebar.hbs */

  $('#say_hello').on('click', function () {
    sayHello(function (error) {
      if (error)
        console.log('Could not send message');
    });
  });

  $('#show-room-details').on('click', function (e) {
    HipChat.room.getRoomDetails(function (err, data) {
      if (!err) {
        $('#more-room-details-title').html('More details');
        $('#more-room-details-body').html(JSON.stringify(data, null, 2));
      }
    });
    e.preventDefault();
  });

  $('#show-room-participants').on('click', function (e) {
    HipChat.room.getParticipants(function (err, data) {
      if (!err) {
        $('#room-participants-title').html('Room participants');
        $('#room-participants-details').html(JSON.stringify(data, null, 2));
      }
    });
    e.preventDefault();
  });

  $('#show-user-details').on('click', function (e) {

    HipChat.user.getCurrentUser(function (err, data) {
      if (!err) {
        $('#more-user-details-title').html('User details');
        $('#more-user-details-body').html(JSON.stringify(data, null, 2));
      }
    });
    e.preventDefault();
  });


  /* Functions used by dialog.hbs */

  //Register a listener for the dialog button - primary action "say Hello"
  HipChat.register({
    "dialog-button-click": function (event, closeDialog) {
      if (event.action === "sample.dialog.action") {
        //If the user clicked on the primary dialog action declared in the atlassian-connect.json descriptor:
        sayHello(function (error) {
          if (!error)
            closeDialog(true);
          else
            console.log('Could not send message');
        });
      } else {
        //Otherwise, close the dialog
        closeDialog(true);
      }
    }
  });

});