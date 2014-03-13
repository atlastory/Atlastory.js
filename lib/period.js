var url = require('./url');

var PeriodLayer = L.TileLayer;

exports.periods = [];

var Period = function(data) {
    this.id = data.id;
    this.start_year = data.start_year;
    this.start_month = data.start_month;
    this.start_day = data.start_day;
    this.end_year = data.end_year;
    this.end_month = data.end_month;
    this.end_day = data.end_day;
};

Period.prototype.start = function() {
    return this.start_year + '-' +
           this.start_month + '-' +
           this.start_day;
};

Period.prototype.end = function() {
    return this.end_year + '-' +
           this.end_month + '-' +
           this.end_day;
};

exports.periodLayer = function(period, options) {
    var map = url.url();
    return new PeriodLayer(map, {
        p: period,
        attribution: '&copy; <a href="http://www.atlastory.com/">Atlastory</a> contributors',
        maxZoom: 9,
        reuseTiles: true
    });
};

exports.addPeriod = function(period) {
    if (!period.id || isNaN(parseFloat(period.id)))
        return console.error("Atlastory#addPeriod: Period is missing an ID number.");
    if (!period.start_year || !period.end_year)
        return console.error("Atlastory#addPeriod: Period is missing start or end year.");

    period = new Period(period);
    exports.periods.push(period);
    Atlastory.trigger("period:add", { period: period });
};
