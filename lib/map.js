var Timeline = require('./timeline');

var Map = L.Map;

module.exports = function(id, time, options) {

    var map = Atlastory.map = new Map(id, {
        zoom: 3,
        center: [20.72, -22.41],
        zoomControl: false,
        inertia: true
    });

    new L.Control.Zoom({ position: 'bottomleft' }).addTo(map);

    Atlastory.timeline = new Timeline(map, time);

    return map;
};
