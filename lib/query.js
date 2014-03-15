
var _date = /-?\b\d+(-|\/)(0[1-9]|1[0-2])(-|\/)(0[1-9]|[1-2][0-9]|3[0-1])\b/,
    _year = /-?\d+/;

var Query = function(query) {
    var qInt, date;

    query = '' + query;
    this.query = query = query.replace(/^[\s\t\r\n]+|[\s\t\r\n]+$/g, '');

    this.status = 'unknown';
    this.error = '';

    qInt = parseFloat(query);

    var isNumber = !isNaN(qInt),
        thisYear = new Date().getFullYear(),
        isDate = (_date.test(query) && qInt < thisYear),
        isYear = (!isDate && _year.test(query) && qInt < thisYear);

    try {
        // Single date
        if (isDate || isYear) this.date();
        // Date range
        // Coordinates
        // x/y/z
        // Location name
        // Commands
    } catch(err) {
        this.error = err;
        this.status = 'failure ('+err+')';
    }
};

var fn = Query.prototype;

// Single date
fn.date = function(date) {
    date = date || this.query;
    date = _date.test(date) ? date : parseFloat(date);
    Atlastory.time.set(date);

    this.status = 'success';
};

module.exports = function(query) {
    query = new Query(query);
    return 'query "' + query.query + '" ' + query.status;
};
