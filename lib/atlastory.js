// Hardcode image path
window.L.Icon.Default.imagePath = 'http://img.atlastory.com/Atlastory.js/v1';

var Atlastory = {}, Period, Markers;

require('./vendor/Atlastory.Events').apply(Atlastory);

window.Atlastory = module.exports = Atlastory;

Atlastory.VERSION = require('../package.json').version;
Atlastory.Util = {};
Atlastory.Browser = window.L.Browser;
Atlastory.hash = window.L.hash;
Atlastory.Modal = require('./modal');

Period = require('./period');
Atlastory.periodLayer = Period.periodLayer;
Atlastory.addPeriod = Period.addPeriod;

Markers = require('./marker');
Atlastory.addMarker = Markers.addMarker;

Atlastory.map = require('./map');
Atlastory.query = require('./query');

//marker
//gridControl
//gridLayer
//featureLayer
