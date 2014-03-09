var Events = require('./Atlastory.Events');

var Time = function(time) {
    this.date = (typeof time === 'number') ? time : 1940;
    this.zoom = 3;
};

Events._applyEvents(Time);

var months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];

Time.prototype.set = function(date) {
    if (typeof date === 'string') this.date = this.translateDate(date);
    if (typeof date == 'number') this.date = date;
    else console.error("Date must be a string or number.");
    this.trigger("change");
};

Time.prototype.get = function() {
    return this.date;
};

Time.prototype.translateDate = function(string){
    if (typeof(string) == "number"){
        return string;
    } else if(string !== null){
        var arr     = string.split("-"),
            day     = arr[2],
            month   = (arr[1] - 1) * 30.4375,
            year    = arr[0];
        return parseFloat(year) + (month + day) / 365.25;
    }
};

// gets the month of a 'year fraction'
Time.prototype.monthString = function(decimal) {
    return months[Math.floor((decimal - Math.floor(decimal)) * 12)];
};

module.exports = Time;
