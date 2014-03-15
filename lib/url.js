module.exports = {
    blankmap: "http://{s}.tiles.mapbox.com/v3/atlastory.map-6k2hhm7v/{z}/{x}/{y}.png",
    base: "http://{s}.tiles.mapbox.com/v3",
    name: "/atlastory.map-6k2hhm7v",
    tile: "/{z}/{x}/{y}.",
    format: "png",
    attribution: '&copy; <a href="http://forum.atlastory.com/">Atlastory contributors</a>',
    url: function() {
        return this.base + this.name + this.tile + this.format;
    },
    period: function(period) {
        return this.url().replace('{p}', period);
    }
};
