// Hardcode image path
window.L.Icon.Default.imagePath = 'http://img.atlastory.com/Atlastory.js/v1';

var Atlastory = window.Atlastory = module.exports = {
    VERSION: require('../package.json').version,
    //marker
    //gridControl
    //gridLayer
    //featureLayer
    map: require('./map'),
    periodLayer: require('./period')
};

Atlastory.hash = L.hash;

