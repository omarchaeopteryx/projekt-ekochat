$( document ).ready(function() {

    $('#new-chat-input-when-time').hide()

    // Add the interactive calendar selection:
    $( "#new-chat-input-when-date" ).datepicker({
                showOn: "button",
                buttonImage: "http://jqueryui.com/resources/demos/datepicker/images/calendar.gif",
                buttonImageOnly: true,
                dateFormat: 'yy-mm-dd'
            });

    // Add the interactive clock selection:
    $('#new-chat-input-when-time-icon').on('click', function() {
      $('#new-chat-input-when-time').fadeIn("slow");
    })
});

// See also: https://weareoutman.github.io/clockpicker/jquery.html
// See also: https://www.npmjs.com/package/material-datetime-picker
