var Timeline = require('./timeline');

var Map = L.Map;

module.exports = function(id, time, options) {

    var mapEl = document.getElementById(id),
        mapViewEl = document.createElement('div');

    mapViewEl.setAttribute('id', 'mapView');
    mapEl.className = 'atlastory-map';
    mapEl.appendChild(mapViewEl);

    var map = Atlastory.map = new Map('mapView', {
        zoom: 3,
        center: [20.72, -22.41],
        zoomControl: false,
        inertia: true
    });

    new L.Control.Zoom({ position: 'bottomleft' }).addTo(map);

    Atlastory._container = mapEl;
    Atlastory.timeline = new Timeline(time);

    return map;
};
