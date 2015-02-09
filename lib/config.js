module.exports = {
    blankmap: "http://{s}.tiles.mapbox.com/v4/atlastory.map-6k2hhm7v/{z}/{x}/{y}.png",
    base: "http://{s}.tiles.mapbox.com/v4",
    name: "/atlastory.{p}",
    tile: "/{z}/{x}/{y}.",
    format: "png",
    options: {
        access_token: "pk.eyJ1IjoiYXRsYXN0b3J5IiwiYSI6ImlseUsxYWMifQ.iw5PR_BCQ0-QBpP5gtWc6A"
    },
    attribution: '&copy; <a href="http://forum.atlastory.com/">Atlastory contributors</a>',
    url: function() {
        var ops = [];
        for (var key in this.options) {
            ops.push(key + '=' + this.options[key]);
        }
        ops = (ops.length) ? '?' + ops.join('&') : "";

        return this.base + this.name + this.tile + this.format + ops;
    },
    period: function(period) {
        return this.url().replace('{p}', period);
    }
};
