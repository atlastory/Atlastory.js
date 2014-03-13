var url = require('./url'),
    Time = require('./time');

var PeriodLayer = L.TileLayer;
var time = new Time();

exports.periods = [];

var Period = function(data, preload) {
    this.id = data.id;
    this.start_year = data.start_year;
    this.start_month = data.start_month || 1;
    this.start_day = data.start_day || 1;
    this.end_year = data.end_year;
    this.end_month = data.end_month || 1;
    this.end_day = data.end_day || 1;
    this._preload = preload;

    this.mapLayer = exports.periodLayer(this.id);
    if (preload) Atlastory.layers.addLayer(this.mapLayer);
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

exports.addPeriod = function(period, options) {
    var preload;

    if (!period.id || isNaN(parseFloat(period.id)))
        return console.error("Atlastory#addPeriod: Period is missing an ID number.");
    if (!period.start_year || !period.end_year)
        return console.error("Atlastory#addPeriod: Period is missing start or end year.");

    options = options || {},
    preload = (typeof options.preload === 'boolean') ? options.preload : false;

    period = new Period(period, preload);
    exports.periods.push(period);
    Atlastory.trigger("period:add", { period: period });
};

function isBefore(year, before) {
    before = time.dateToYear(before);
    return (year <= before);
}

function isAfter(year, after) {
    after = time.dateToYear(after);
    return (year > after);
}

exports.getPeriodByYear = function(year) {
    var per, p;

    for (p in exports.periods) {
        per = exports.periods[p];
        if (isAfter(year, per.start()) && isBefore(year, per.end())) {
            return per;
        }
    }

    return false;
};
