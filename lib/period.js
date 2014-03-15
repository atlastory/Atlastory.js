var config = require('./config'),
    Time = require('./time');

var PeriodLayer = L.TileLayer;
var time = new Time();

exports.periods = [];

var Period = function(data) {
    this.id = data.id;
    this.start_year = data.start_year;
    this.start_month = data.start_month || 1;
    this.start_day = data.start_day || 1;
    this.end_year = data.end_year;
    this.end_month = data.end_month || 1;
    this.end_day = data.end_day || 1;
    this._preload = Atlastory._options.preload;

    this.mapLayer = exports.periodLayer(this.id);
    if (this._preload) Atlastory.layers.addLayer(this.mapLayer);
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
    var map = config.url();
    return new PeriodLayer(map, {
        p: period,
        attribution: config.attribution,
        maxZoom: 9,
        reuseTiles: true,
        detectRetina: Atlastory._options.detectRetina
    });
};

exports.addPeriod = function(period, options) {
    if (!period.id || isNaN(parseFloat(period.id)))
        return console.error("Atlastory#addPeriod: Period is missing an ID number.");
    if (!period.start_year || !period.end_year)
        return console.error("Atlastory#addPeriod: Period is missing start or end year.");

    options = options || {};

    period = new Period(period);
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

exports._dateToYear = time.dateToYear;
