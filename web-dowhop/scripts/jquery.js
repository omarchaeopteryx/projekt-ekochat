$( document ).ready(function() {
    console.log( "ready!" );
    $( "#new-chat-input-when-date" ).datepicker({
                showOn: "button",
                buttonImage: "http://jqueryui.com/resources/demos/datepicker/images/calendar.gif",
                buttonImageOnly: true
            });
});
