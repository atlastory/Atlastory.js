// Hardcode image path
window.L.Icon.Default.imagePath = 'http://img.atlastory.com/Atlastory.js/v1';

var Atlastory = {},
    Period = require('./period'),
    Events = require('./Atlastory.Events');

Events.apply(Atlastory);

Atlastory.VERSION = require('../package.json').version;
Atlastory.map = require('./map');

Atlastory.periodLayer = Period.periodLayer;
Atlastory.addPeriod = Period.addPeriod;

Atlastory.hash = L.hash;

//marker
//gridControl
//gridLayer
//featureLayer

window.Atlastory = module.exports = Atlastory;
