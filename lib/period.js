var url = require('./url');

var PeriodLayer = L.TileLayer;

module.exports = function(period, options) {
    var map = url.url();
    return new PeriodLayer(map, {
        p: period,
        attribution: '&copy; <a href="http://www.atlastory.com/">Atlastory</a> contributors',
        maxZoom: 9,
        reuseTiles: true
    });
};
