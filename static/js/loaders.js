$.ajaxStart(function () {
    $('#map').hide();  // show loading indicator
    $('#map_legend').hide();  // show loading indicator
    $('#loadingMap').show();  // show loading indicator
});

$.ajaxStop(function() {
    $('#loadingMap').hide();  // hide loading indicator
    $('#map').show();  // show loading indicator
    $('#map_legend').show();  // show loading indicator
});