var Events = require('./Atlastory.Events'),
    Time = require('./time');

var hasTouch = window.Atlastory.Browser.touch;
if (hasTouch) require('./jQuery.finger');

require('./jQuery.plugins');

var zoomLevels = {
    0: {scale: 100, interval: 90},
    1: {scale: 25,  interval: 80},
    2: {scale: 10,  interval: 70},
    3: {scale: 5,   interval: 65},
    4: {scale: 1,   interval: 60}
};

var Timeline = function(time, zoom) {
    this._zoom = 0;
    this._interval = 0;
    this._visibleMarks = 0;
    this._startYear = 0;
    this._sliderPos = 0;
    this._map = Atlastory.map;
    this._container = Atlastory._container;

    Atlastory.time = new Time(time, zoom || 2);

    // Trigger update whenever date is updated externally
    this.on("change", this.change, this);
    Atlastory.time.on("change", this.create, this);
    this._map.on("resize", this.resize, this);

    this.initialize();
    this.initPeriods();
};

var fn = Timeline.prototype;

Events.apply(Timeline);

fn.initialize = function() {
    this.$timeline = $('<div class="timeline"/>');
    this.$timeline.appendTo(this._container);
    this.buildDOM();

    // UI interaction events
    if (hasTouch) this.$scale.on("tap doubletap", this.moveToDate.bind(this));
    else this.$scale.on("dblclick", this.moveToDate.bind(this));
    this.$slider.drag({
        constraint: "x",
        xbounds: [0, 1000],
        dragClass: "drag",
        onStop: this.stop.bind(this),
        onDrag: this.drag.bind(this)
    });

    this.create();
    this.$timeline.css("visibility", "visible");
};

fn.buildDOM = function() {
    var $tl = this.$timeline;

    $tl.empty();
    $tl.html('<div class="box">' +
        '<div class="container">' +
            '<div class="timescale">' +
                '<div class="time"></div>' +
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
};

// Updates timeline based on external change in data
fn.create = function(mode) {
    var zoomLvl  = Atlastory.time.zoom,
        date     = Atlastory.time.date,
        winWidth = $(this._container).width(),
        lastIntv = this._interval,
        intv, left;

    this._zoom = zoomLvl;
    intv = this._interval = zoomLevels[zoomLvl].interval;
    this._visibleMarks = Math.ceil(winWidth / intv);

    this.$slider.width(intv);

    if (mode == 'zoom') {
        left = this.$slider.position().left - (intv - lastIntv)/2;
        if (left < 0) left = 0;
        this.resize({ slide: left });
    } else if (this._isInFuture()) {
        left = this.$slider.position().left;
        this.resize({ slide: left });
    } else {
        this.resize();
    }
};

// Renders timeline based on slider, zoom, dates
fn.render = function(slideX, date, fx) {
    var $scale = this.$scale,
        intv = this._interval,
        visM = this._visibleMarks,
        marks = visM * 5,
        z = zoomLevels[this._zoom].scale,
        dateStart, yearMark, startYear, sliderPos, newLeft;

    date = date || Atlastory.time.date;
    dateStart = date - z / 2;
    yearMark = Math.round(dateStart / z) * z;
    startYear = yearMark - visM * z * 2;

    this._startYear = startYear;
    $scale.width(visM * intv * 5);

    // Creates timeline visuals
    var $labels = $('<div class="layer"/>'),
        $major  = $('<div class="layer"/>');
    for (var i=0; i<marks; i++) {
        var year = startYear + i * z;
        if (year < new Date().getFullYear()) {
            $('<div class="label"/>').css("left", intv*i)
                .html(year === 0 ? "0" : year).appendTo($labels);
            $('<div class="major"/>').css("left", intv*i).appendTo($major);
        }
    }
    $(".time", $scale).empty().append($labels, $major);

    // Moves scale to current position
    sliderPos = slideX || this.$slider.position().left;
    newLeft = -(dateStart - startYear)/z * intv + sliderPos;
    this._sliderPos = sliderPos;
    $scale.css("left", newLeft);

    // Make sure timeline stops at current year
    if (this._isInFuture()) {
        newLeft = -(this._yearInPx() - this.$timeline.width());
        $scale.css("left", newLeft);
        this.$slider.css("left", this._yearInPx(date) + newLeft - intv/2);
    }

    // Feeds back new numbers for jQuery animate
    if (fx) {
        var adjust  = newLeft - fx.now;
        fx.now = newLeft;
        fx.start = fx.start + adjust;
        fx.end = fx.end + adjust;
    }

    var selectMonth = this._zoom >= 3 ? Atlastory.time.monthString(date) + " " : "";
    $(".label", this.$slider).html(selectMonth + Math.floor(date));

    this.trigger("render");
};

fn._yearInPx = function(year) {
    year = year || new Date().getFullYear();
    return (year - this._startYear) /
        zoomLevels[this._zoom].scale * this._interval;
};

fn._isInFuture = function() {
    var fromLeft = this._yearInPx() + this.$scale.position().left;
    return (fromLeft <= this.$timeline.outerWidth());
};

// Updates date range data whenever timeline is changed:
fn.change = function() {
    var $scale = this.$scale,
        $slider = this.$slider,
        intv = this._interval,
        z = zoomLevels[this._zoom].scale,
        startYear = this._startYear,
        slideX = $slider.position().left - $scale.position().left,
        date = ((slideX + $slider.width()/2) / intv) * z + startYear;

    var selectMonth = this._zoom >= 3 ? Atlastory.time.monthString(date) + " " : "";
    $(".label", $slider).html(selectMonth + Math.floor(date));

    Atlastory.time.date = date;
    Atlastory.time.zoom = this._zoom;
};

// Shifts the timescale when slider is dragged
fn.drag = function(e, ui) {
    this.trigger("change");

    var width = this.$timeline.outerWidth(),
        slWidth = this.$slider.width(),
        left = ui.left,
        right = slWidth + left,
        z = zoomLevels[this._zoom].scale,
        self = this;

    // Stops the animation if user reverses slider direction
    if (left < 0.5 * width && this._sliderPos <= left ||
        left > 0.5 * width && this._sliderPos >= left) {
        this.$scale._stop().clearQueue();
        this._sliderPos = left;
        return false;
    }
    this._sliderPos = (left < 0.5 * width) ? left + 3 : left - 3;

    // Stops animation if timeline ends
    if (this._isInFuture() && this._sliderPos <= left) {
        this.$scale._stop().clearQueue();
        this._sliderPos = left;
        return false;
    }

    // Decides how fast animation should be
    var startTime   = 3000,
        endTime     = 800,
        bounds      = 0.2,
        timeDelta   = startTime - endTime,
        totalDur    = timeDelta/bounds,
        leftTime    = totalDur*(left/width) + endTime,
        rightTime   = totalDur - totalDur*(right/width) + endTime;

    // Timeline left/right animation
    if (leftTime < startTime)
        this.$scale._animate({ left:'+=500' }, {
            duration: leftTime, easing: "linear", step: reRender.bind(this)
        });
    if (rightTime < startTime)
        this.$scale._animate({ left:'-=500' }, {
            duration: rightTime, easing: "linear", step: reRender.bind(this)
        });

    // Checks if user is near timescale boundaries, re-renders if so:
    function reRender(now, fx) {
        var reloadBuff = this._visibleMarks/2,
            intv    = this._interval,
            scLeft      = now,
            scRight     = this.$scale.width() + scLeft - this.$container.width(),
            left        = ui.left,
            right       = slWidth + left,
            date        = ((left-scLeft+slWidth/2)/intv)*z + this._startYear,
            leftTime    = totalDur*(left/width) + endTime,
            rightTime   = totalDur - totalDur*(right/width) + endTime;

        if (this._isInFuture()) this.stop();

        if (left < 0.5 * width) fx.options.duration = leftTime;
                           else fx.options.duration = rightTime;

        if (scLeft > (-intv * reloadBuff) || scRight < (intv * reloadBuff))
            this.render(left, date, fx);
    }
};

fn.stop = function(e,ui){
    this.$scale.clearQueue()._stop();
    this.trigger("change");
};

fn.moveToDate = function(e){
    var x = e.clientX || e.x,
        left   = x - this.$timeline.position().left,
        width  = this.$slider.width(),
        newPos = left - width/2,
        self   = this;

    this.$slider.animate({ left: newPos }, 400, "swing", function(){
        self.trigger("change");
    });
};

fn.zoomIn = function(e, z) {
    if (isNaN(z)) z = 1;
    var lvl = this._zoom + z;
    if (!zoomLevels[lvl]) return true;
    Atlastory.time.set({ zoom: lvl });
    this._zoom = lvl;
    this.create("zoom");
};

fn.zoomOut = function(e, z){
    if (isNaN(z)) z = -1;
    var lvl = this._zoom + z;
    if (!zoomLevels[lvl]) return true;
    Atlastory.time.set({ zoom: lvl });
    this._zoom = lvl;
    this.create("zoom");
};

fn.resize = function(data) {
    var width, slideX;

    width = (data && data.newSize) ? data.newSize.x : $(this._container).width();
    slideX = (data && data.slide) ? data.slide : width/2 - this._interval/2; // Centers slider

    this.$container.width(width);
    this.$scale.width(this._visibleMarks * this._interval * 5);
    this.$slider.css('left', slideX).dragUpdate({
        //snap: [this._interval/(zoomLevels[this._zoom].scale * 12), 1],
        xbounds: [-this._interval / 2, width + this._interval / 2]
    });

    this.trigger("resize");
    this.render();
};

module.exports = Timeline;
