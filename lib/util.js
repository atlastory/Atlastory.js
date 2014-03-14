
// Mobile device detection

exports.agent = {
    name: "Non-mobile",
    detect: function(key) {
        var name;
        if(this[key] === undefined) {
            name = navigator.userAgent.match(new RegExp(key, 'i'));
        }

        if (name !== null){
            this[key] = true;
            this.name = name;
        } else {
            this[key] = false;
        }

        return this[key];
    },
    init: function() {
        this.detect("iPhone");
        this.detect("iPad");
        this.detect("iPod");
        this.detect("Android");
        this.detect("webOS");
        this.detect("Windows Phone");
        this.iOS = false;
        this.isMobile = false;

        if (this.iPhone || this.iPad || this.iPod)
            this.iOS = true;
        if (this['iOS'] || this['Android'] || this['webOS'] || this['Windows Phone'])
            this.isMobile = true;
    }
};

