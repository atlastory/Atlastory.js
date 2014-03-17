
var Marker = function(data) {
    this.id = data.id || 0;
    this.date = typeof data.date === 'string' ?
        data.date : data.date + '-01-01';
    this.lat = data.lat;
    this.lon = data.lon;
    this.name = data.name;
    this.description = data.description;

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


