var Events = require('./vendor/Atlastory.Events');

var Time = function(time, zoom) {
    this.date = (typeof time === 'number') ? time : 1940;
    this.zoom = (typeof time === 'number') ? zoom : 2;
};

Events.apply(Time);

var months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];

Time.prototype.set = function(date) {
    if (typeof date === 'string') this.date = this.dateToYear(date);
    else if (typeof date == 'number') this.date = date;
    else if (date && date.date || date && date.zoom) {
        if (date.date) this.date = date.date;
        if (date.zoom) this.zoom = date.zoom;
    }
    else console.error("Date must be a string or number.");

    this.trigger("change");
};

Time.prototype.get = function() {
    return this.date;
};

// Converts date string to year fraction
Time.prototype.dateToYear = function(string) {
    if (!string) return;

    var arr, day, month, year;

    string = string.replace(/[\s\t\r\n]/g, '');
    arr = string.split("-");
    // Allow both '-' and '/' seperators
    if (arr.length == 1 && /\//.test(string)) arr = string.split('/');
    // Account for negative years
    if (arr.length == 4 && arr[0] === '') { arr.shift(); arr[0] = '-'+arr[0]; }

    day = parseFloat(arr[2]);
    month = (parseFloat(arr[1]) - 1) * 30.4375;
    year = parseFloat(arr[0]);

    return year + (month + day) / 365.25;
};

// Converts year fraction to date string
Time.prototype.yearToDate = function(yearFrac) {
    var year = Math.floor(yearFrac),
        month = Math.floor((yearFrac - year) * 12) + 1,
        day = Math.floor((yearFrac - year) * 365.25 - month * 30.4375);

    if (month < 10) month = '0' + month;

    return year + '-' + month + '-' + day;
};

// gets the month of a 'year fraction'
Time.prototype.monthString = function(year) {
    return months[Math.floor((year - Math.floor(year)) * 12)];
};

module.exports = Time;
