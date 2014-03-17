var Marker = require('./marker');

module.exports = function(fn) {

fn._hooks.markers = function() {
    this.$markers = $('<div class="time markers"/>');
    this.$markers.appendTo(this.$scale);

    Atlastory.on("marker:add marker:remove", this.renderMarkers, this);
    this.on({
        "render": this.renderMarkers,
        "change": this.showMapMarkers
    }, this);
};

fn.renderMarkers = function() {
    var mrk, m, left,
        time = Atlastory.time;

    var $markerDiv = $('<div class="layer"/>');
    for (m in Marker.markers) {
        mrk = Marker.markers[m];
        left = this._yearInPx(time.dateToYear(mrk.date)) - 3;
        $('<div class="marker"/>').css("left", left)
            .appendTo($markerDiv);
    }

    this.$markers.empty().append($markerDiv);

    // Show markers on map
    this.showMapMarkers();
};

fn.showMapMarkers = function() {
    var mrk, m, inRange,
        time = Atlastory.time;

    Atlastory.markers.clearLayers();
    for (m in Marker.markers) {
        mrk = Marker.markers[m];
        inRange = this._inRange(time.dateToYear(mrk.date));
        if (inRange) Atlastory.markers.addLayer(mrk.object);
    }
};

};
