
var Marker = function(data) {
    this.id = data.id || 0;
    this.date = typeof data.date === 'string' ?
        data.date : data.date + '-01-01';
    this.lat = data.lat;
    this.lon = data.lon;
    this.name = data.name;
    this.description = data.description;

    if (data.link && data.link !== '') this.description += '<br/>' +
        '<a href="' + data.link + '" class="read-more" target="_blank">' +
        'Read more &raquo;</a>';

    this.object = new L.Marker([this.lat, this.lon], {
        title: this.name
    });

    this.object.bindPopup(this.description);
};

exports.markers = [];

exports.addMarker = function(marker, options) {
    options = options || {};

    marker = new Marker(marker);
    exports.markers.push(marker);
    Atlastory.trigger("marker:add", { marker: marker });
};

exports.addMarkers = function(markers) {
    if (!Array.isArray(markers) && markers.lat) {
        return exports.addMarker(markers);
    } else if (Array.isArray(markers)) {
        for (var m in markers) exports.addMarker(markers[m]);
    } else {
        console.error("#addMarkers must be given an array");
    }
};

