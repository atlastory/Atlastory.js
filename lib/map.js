var Timeline = require('./timeline'),
    config = require('./config');


require('./timeline.periods')(Timeline.prototype);
require('./timeline.markers')(Timeline.prototype);

require('./vendor/tooltip');

var Logo = L.Control.extend({
    options: { position: 'bottomright' },
    onAdd: function(map) {
        var $logo = $('<div class="map-logo"/>');
        Atlastory._logo = $logo[0];
        return $logo[0];
    }
});

var Map = function(id, time, options) {
    var mapEl, mapViewEl;

    mapEl = document.getElementById(id);
    mapViewEl = document.createElement('div');

    mapViewEl.setAttribute('id', 'mapView');
    mapEl.className = 'atlastory-map';
    mapEl.appendChild(mapViewEl);

    // Set default options
    var o = L.Util.extend({
        preload: false,
        timezoom: 2,
        rainbow: true,
        detectRetina: false
    }, options);

    // Create map & controls
    var map = Atlastory.map = new L.Map('mapView', {
        zoom: 3,
        center: [20.72, -22.41],
        zoomControl: false,
        inertia: true
    });

    map.addControl(new Logo());
    if (!Atlastory.Browser.touch)
        new L.Control.Zoom({ position: 'bottomleft' }).addTo(map);

    // Create "blank" map layer & default layer groups
    Atlastory._blankLayer = new L.TileLayer(config.blankmap, {
        maxZoom: 9,
        reuseTiles: true,
        detectRetina: o.detectRetina
    });
    Atlastory.layers = new L.LayerGroup().addTo(map);
    Atlastory.markers = new L.LayerGroup().addTo(map);
    if (o.preload) Atlastory.layers.addLayer(Atlastory._blankLayer);

    Atlastory._container = mapEl;
    Atlastory._options = o;
    Atlastory.timeline = new Timeline(time, o.timezoom);

    return map;
};

module.exports = Map;
