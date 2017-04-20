$( document ).ready(function() {

    $('#new-chat-input-when-time').hide()
    // console.log( "ready!" ); // <-- Debugging

    // Add the interactive calendar selection:
    $( "#new-chat-input-when-date" ).datepicker({
                showOn: "button",
                buttonImage: "http://jqueryui.com/resources/demos/datepicker/images/calendar.gif",
                buttonImageOnly: true
            });

    // Add the interactive clock selection:
    $('#new-chat-input-when-time-icon').on('click', function() {
      console.log('you clocked a clock!');
      $('#new-chat-input-when-time').show();
    })
});

// See also: https://weareoutman.github.io/clockpicker/jquery.html
// See also: https://www.npmjs.com/package/material-datetime-picker
