var Events = require('./Atlastory.Events'),
    Time = require('./time');

require('./$.animate')

var zoomLevels = {
    0: {scale: 100, interval: 90},
    1: {scale: 25,  interval: 80},
    2: {scale: 10,  interval: 70},
    3: {scale: 1,   interval: 60}
};

var Timeline = function(map, time) {
    this._map = map;
    Atlastory.time = new Time(time);

    if (map._container) this._container = map._controlContainer;
    else if (map.tagName == "DIV") this._container = map;
    else if (typeof map === 'string') this._container = $('#'+map)[0];
    else console.error("Timeline map not found.");

    Atlastory.time.on("change", this.create, this);
    this.on("change", this.change, this);

    this.initialize();
};

Events._applyEvents(Timeline);

Timeline.prototype.initialize = function() {
    this.$timeline = $('<div class="timeline"/>');
    this.$timeline.appendTo(this._container);
    this.buildDOM();

    this.create();
    this.$timeline.css("visibility", "visible");
};

Timeline.prototype.buildDOM = function() {
    var $tl = this.$timeline;

    $tl.empty();
    $tl.html('<div class="box">' +
        '<div class="container">' +
            '<div class="timescale">' +
                '<div class="inner"></div>' +
            '</div>' +
        '</div>' +
        '<div class="slider">' +
            '<div class="top"></div>' +
            '<div class="selection"><span></span></div>' +
            '<div class="label"></div>' +
        '</div>' +
    '</div>');

    this.$container = $('.timeline .container');
    this.$scale = $('.timeline .timescale');
    this.$slider = $('.timeline .slider');

    this.$scale.dblclick(this.moveToDate);
};

Timeline.prototype.create = function() {
    console.log("create");
};

module.exports = Timeline;
