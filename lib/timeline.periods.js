var Period = require('./period');

module.exports = function(fn) {

fn.initPeriods = function(timeline) {
    this.$periods = $('<div class="time periods"/>');
    this.$periods.appendTo(this.$scale);

    Atlastory.on("period:add period:remove", this.renderPeriods, this);
    this.on({
        "render": this.renderPeriods,
        "change": this.renderMap
    }, this);
};

fn.renderPeriods = function() {
    var per, p, left, right, lastColor;

    lastColor = 0;

    function pickColor() {
        var colors = [
            "atlastory-magenta",
            "atlastory-orange",
            "atlastory-yellow",
            "atlastory-lime",
            "atlastory-green"
        ];
        if (lastColor == colors.length - 1) lastColor = 0;
        return colors[lastColor++];
    }

    // Creates period ribbons on timeline
    var $ribbons = $('<div class="layer"/>');
    for (p in Period.periods) {
        per = Period.periods[p];
        left = this._yearInPx(Period._dateToYear(per.start()));
        right = this._yearInPx(Period._dateToYear(per.end()));
        $('<div class="ribbon"/>').css("left", left)
            .toggleClass("blue", !Atlastory._options.rainbow)
            .toggleClass(pickColor(), Atlastory._options.rainbow)
            .width(right - left).appendTo($ribbons);
    }

    this.$periods.empty().append($ribbons);

    // Render map with current periods
    this.renderMap();
};

fn.renderMap = function() {
    var year = Atlastory.time.get(),
        period = Period.getPeriodByYear(year);

    if (period) {
    // If there's a period, show it
        if (period._preload) period.mapLayer.bringToFront();
        else if (!Atlastory.layers.hasLayer(period.mapLayer)) {
            Atlastory.layers.clearLayers()
                .addLayer(period.mapLayer);
        }
    } else {
    // If there aren't any periods, show only blank map
        var blank = Atlastory._blankLayer;
        if (period._preload) blank.bringToFront();
        else if (!Atlastory.layers.hasLayer(blank)) Atlastory.layers.clearLayers()
            .addLayer(blank);
    }
};

};
