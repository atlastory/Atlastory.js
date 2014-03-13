var Timeline = require('./timeline'),
    TimelinePeriods = require('./timeline.periods'),
    url = require('./url');

var Map = L.Map;

TimelinePeriods(Timeline.prototype);

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

    Atlastory._blankLayer = new L.TileLayer(url.blankmap, {
        maxZoom: 9,
        reuseTiles: true
    });
    Atlastory.layers = new L.LayerGroup().addTo(map);
    Atlastory._container = mapEl;

    Atlastory.timeline = new Timeline(time);

    return map;
};
