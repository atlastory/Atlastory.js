(function($) {

    // Gets mouse position for all browsers

    var isChrome = /chrome/i.exec(navigator.userAgent),
        isAndroid = /android/i.exec(navigator.userAgent),
        hasTouch = 'ontouchstart' in window && !(isChrome && !isAndroid);

    var Mouse = {
        x: 0,
        y: 0,
        init: function(e) {
            Mouse.x = Mouse.page('x', e);
            Mouse.y = Mouse.page('y', e);
        },
        page: function(axis, e) {
            if (!e) e = window.event;
            axis = axis.toUpperCase();
            if (hasTouch) e = e.originalEvent.touches[0];
            if (e['page'+axis]) return e['page'+axis];
            else if (e['client'+axis]) return e['client'+axis] + document.body.scrollLeft + document.documentElement.scrollLeft;
        }
    };

    $(function(){
        $(window).on("mousemove touchmove", Mouse.init);
    });

    // Prevents selection

    $.fn.selectOff = function() {
        return this.each(function(){
            if ($.support.selectstart)
                $(this).on("selectstart.select", function(){ return false; });
            else $(this).on("mousedown.select touchstart.select", function(){ return false; });
        });
    };
    $.fn.selectOn = function() {
        return this.off(".select");
    };

    /* Drag element UI
     *
     * constraint   STRING    x, y, container, x-container, y-container
     * xbounds      ARRAY     [left limit, right limit]
     * ybounds      ARRAY     [top limit, bottom limit]
     * snap         ARRAY     [x snap, y snap]
     * dragClass    STRING    name of class to toggle when dragging
     * onStart      FUNCTION  runs when dragging starts
     * onDrag       FUNCTION  runs while dragging
     * onStop       FUNCTION  runs when dragging stops
     */

    $.fn.drag = function(options){
        var o = $.extend({
            constraint: false,
            xbounds: false,
            ybounds: false,
            snap: [1,1],
            onStart: function(){},
            onDrag: function(){},
            onStop: function(){},
            dragClass: ""
        }, options);
        return this.each(function(){
            $(this).data("drag", new DragObj($(this), o));
        });
    };

    $.fn.dragUpdate = function(o){ return $(this).data("drag").update(o); };

    function DragObj(el, o){

        this.o = o;
        var self = this, ui = {};

        this.update = function(options){
            $.extend(self.o, options);
        };

        function newEvent(e) {
            if (hasTouch) return e.originalEvent.touches[0];
            else return e;
        }

        function init(){
            ui.pos = el.position();
            el.css({
                position: 'absolute',
                top: ui.pos.top,
                left: ui.pos.left
            });
            el.on("mousedown touchstart", setEvents);
            return self;
        }

        function setEvents(e) {
            // Adds drag events
            window.focus();
            $(document)
                .on("mousemove.drag touchmove.drag", mouseMove)
                .on("mouseup.drag touchend.drag touchcancel.drag", mouseUp)
                .selectOff();

            e.preventDefault();

            // Sets starting positions
            ui.el = el;
            ui.startX = Mouse.page('x', e);
            ui.startY = Mouse.page('y', e);
            ui.pos = el.position();
            el.addClass(self.o.dragClass);
            self.o.onStart(newEvent(e), ui);
            return false;
        }

        function mouseMove(e) {
            window.focus();
            var movedX  = Mouse.x - ui.startX,
                movedY  = Mouse.y - ui.startY,
                parent  = el.parent(),
                cons = self.o.constraint;

            movedX = Math.round(movedX/self.o.snap[0]) * self.o.snap[0];
            movedY = Math.round(movedY/self.o.snap[1]) * self.o.snap[1];

            if (/^x/.test(cons)) movedY = 0;
            if (/^y/.test(cons)) movedX = 0;

            var moveX = ui.pos.left + movedX,
                moveY = ui.pos.top + movedY,
                rightBound, bottomBound;

            if (/container/.test(cons)){
                if (/^x|^c/.test(cons)) {
                    rightBound  = parent.width() - el.outerWidth();
                    if (moveX < 0) moveX = 0;
                    if (moveX > rightBound) moveX = rightBound;
                }
                if (/^y|^c/.test(cons)) {
                    bottomBound = parent.height() - el.outerHeight();
                    if (moveY < 0) moveY = 0;
                    if (moveY > bottomBound) moveY = bottomBound;
                }
            }

            if (self.o.xbounds) {
                rightBound = self.o.xbounds[1] - el.outerWidth();
                if (moveX < self.o.xbounds[0]) moveX = self.o.xbounds[0];
                if (moveX > rightBound) moveX = rightBound;
            }

            if (self.o.ybounds) {
                bottomBound = self.o.ybounds[1] - el.outerHeight();
                if (moveY < self.o.ybounds[0]) moveY = self.o.ybounds[0];
                if (moveY > bottomBound) moveY = bottomBound;
            }

            el.css({left: moveX, top: moveY});
            ui.left = moveX;
            ui.top = moveY;
            ui.movedX = movedX;
            ui.movedY = movedY;
            if (movedX !== 0 || movedY !== 0) self.o.onDrag(newEvent(e), ui);

            e.preventDefault();
        }

        function mouseUp(e){
            $(document).off(".drag").selectOn();
            el.removeClass(self.o.dragClass);
            self.o.onStop(newEvent(e), ui);
        }
        return init();
    }

    /////////////////////////////
    // Old jQuery 1.7 Animate
    //
    // jQuery 1.8+ incompatible
    // with Timeline
    //
    // Called through:
    // $._animate + $._stop
    /////////////////////////////

    var jQ = {};

    var elemdisplay = {},
        iframe, iframeDoc,
        rfxtypes = /^(?:toggle|show|hide)$/,
        rfxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,
        timerId,
        fxAttrs = [
            // height animations
            [ "height", "marginTop", "marginBottom", "paddingTop", "paddingBottom" ],
            // width animations
            [ "width", "marginLeft", "marginRight", "paddingLeft", "paddingRight" ],
            // opacity animations
            [ "opacity" ]
        ],
        fxNow;

    $.fn._animate = function(prop, speed, easing, callback){
        var optall = jQ.speed( speed, easing, callback );

        if ( $.isEmptyObject( prop ) ) {
            return this.each( optall.complete, [ false ] );
        }

        // Do not change referenced properties as per-property easing will be lost
        prop = $.extend( {}, prop );

        function doAnimation() {

            if ( optall.queue === false ) {
                jQ._mark( this );
            }

            var opt = $.extend( {}, optall ),
                isElement = this.nodeType === 1,
                hidden = isElement && $(this).is(":hidden"),
                name, val, p, e,
                parts, start, end, unit,
                method;

            // will store per property easing and be used to determine when an animation is complete
            opt.animatedProperties = {};

            for ( p in prop ) {

                // property name normalization
                name = $.camelCase( p );
                if ( p !== name ) {
                    prop[ name ] = prop[ p ];
                    delete prop[ p ];
                }

                val = prop[ name ];

                // easing resolution: per property > opt.specialEasing > opt.easing > 'swing' (default)
                if ( $.isArray( val ) ) {
                    opt.animatedProperties[ name ] = val[ 1 ];
                    val = prop[ name ] = val[ 0 ];
                } else {
                    opt.animatedProperties[ name ] = opt.specialEasing && opt.specialEasing[ name ] || opt.easing || 'swing';
                }

                if ( val === "hide" && hidden || val === "show" && !hidden ) {
                    return opt.complete.call( this );
                }

                if ( isElement && ( name === "height" || name === "width" ) ) {
                    // Make sure that nothing sneaks out
                    // Record all 3 overflow attributes because IE does not
                    // change the overflow attribute when overflowX and
                    // overflowY are set to the same value
                    opt.overflow = [ this.style.overflow, this.style.overflowX, this.style.overflowY ];

                    // Set display property to inline-block for height/width
                    // animations on inline elements that are having width/height animated
                    if ( $.css( this, "display" ) === "inline" &&
                            $.css( this, "float" ) === "none" ) {

                        // inline-level elements accept inline-block;
                        // block-level elements need to be inline with layout
                        if ( !$.support.inlineBlockNeedsLayout || defaultDisplay( this.nodeName ) === "inline" ) {
                            this.style.display = "inline-block";

                        } else {
                            this.style.zoom = 1;
                        }
                    }
                }
            }

            if ( opt.overflow != null ) {
                this.style.overflow = "hidden";
            }

            for ( p in prop ) {
                e = new jQ.fx( this, opt, p );
                val = prop[ p ];

                if ( rfxtypes.test( val ) ) {

                    // Tracks whether to show or hide based on private
                    // data attached to the element
                    method = $._data( this, "toggle" + p ) || ( val === "toggle" ? hidden ? "show" : "hide" : 0 );
                    if ( method ) {
                        $._data( this, "toggle" + p, method === "show" ? "hide" : "show" );
                        e[ method ]();
                    } else {
                        e[ val ]();
                    }

                } else {
                    parts = rfxnum.exec( val );
                    start = e.cur();

                    if ( parts ) {
                        end = parseFloat( parts[2] );
                        unit = parts[3] || ( $.cssNumber[ p ] ? "" : "px" );

                        // We need to compute starting value
                        if ( unit !== "px" ) {
                            $.style( this, p, (end || 1) + unit);
                            start = ( (end || 1) / e.cur() ) * start;
                            $.style( this, p, start + unit);
                        }

                        // If a +=/-= token was provided, we're doing a relative animation
                        if ( parts[1] ) {
                            end = ( (parts[ 1 ] === "-=" ? -1 : 1) * end ) + start;
                        }

                        e.custom( start, end, unit );

                    } else {
                        e.custom( start, val, "" );
                    }
                }
            }

            // For JS strict compliance
            return true;
        }

        return optall.queue === false ?
            this.each( doAnimation ) :
            this.queue( optall.queue, doAnimation );
    };

    $.fn._stop = function( type, clearQueue, gotoEnd ) {
        if ( typeof type !== "string" ) {
            gotoEnd = clearQueue;
            clearQueue = type;
            type = undefined;
        }
        if ( clearQueue && type !== false ) {
            this.queue( type || "fx", [] );
        }

        return this.each(function() {
            var index,
                hadTimers = false,
                timers = $.timers,
                data = $._data( this );

            // clear marker counters if we know they won't be
            if ( !gotoEnd ) {
                jQ._unmark( true, this );
            }

            function stopQueue( elem, data, index ) {
                var hooks = data[ index ];
                $.removeData( elem, index, true );
                hooks.stop( gotoEnd );
            }

            if ( type == null ) {
                for ( index in data ) {
                    if ( data[ index ] && data[ index ].stop && index.indexOf(".run") === index.length - 4 ) {
                        stopQueue( this, data, index );
                    }
                }
            } else if ( data[ index = type + ".run" ] && data[ index ].stop ){
                stopQueue( this, data, index );
            }

            for ( index = timers.length; index--; ) {
                if ( timers[ index ].elem === this && (type == null || timers[ index ].queue === type) ) {
                    if ( gotoEnd ) {

                        // force the next step to be the last
                        timers[ index ]( true );
                    } else {
                        timers[ index ].saveState();
                    }
                    hadTimers = true;
                    timers.splice( index, 1 );
                }
            }

            // start the next in the queue if the last step wasn't forced
            // timers currently will call their complete callbacks, which will dequeue
            // but only if they were gotoEnd
            if ( !( gotoEnd && hadTimers ) ) {
                $.dequeue( this, type );
            }
        });
    }


    $.extend(jQ,{
        speed: function( speed, easing, fn ) {
            var opt = speed && typeof speed === "object" ? $.extend( {}, speed ) : {
                complete: fn || !fn && easing ||
                    $.isFunction( speed ) && speed,
                duration: speed,
                easing: fn && easing || easing && !$.isFunction( easing ) && easing
            };

            opt.duration = jQ.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration :
                opt.duration in jQ.fx.speeds ? jQ.fx.speeds[ opt.duration ] : jQ.fx.speeds._default;

            // normalize opt.queue - true/undefined/null -> "fx"
            if ( opt.queue == null || opt.queue === true ) {
                opt.queue = "fx";
            }

            // Queueing
            opt.old = opt.complete;

            opt.complete = function( noUnmark ) {
                if ( $.isFunction( opt.old ) ) {
                    opt.old.call( this );
                }

                if ( opt.queue ) {
                    $.dequeue( this, opt.queue );
                } else if ( noUnmark !== false ) {
                    jQ._unmark( this );
                }
            };

            return opt;
        },

        easing: {
            linear: function( p, n, firstNum, diff ) {
                return firstNum + diff * p;
            },
            swing: function( p, n, firstNum, diff ) {
                return ( ( -Math.cos( p*Math.PI ) / 2 ) + 0.5 ) * diff + firstNum;
            }
        },

        timers: [],

        fx: function( elem, options, prop ) {
            this.options = options;
            this.elem = elem;
            this.prop = prop;

            options.orig = options.orig || {};
        },

        _mark: function( elem, type ) {
            if ( elem ) {
                type = ( type || "fx" ) + "mark";
                $._data( elem, type, ($._data( elem, type ) || 0) + 1 );
            }
        },

        _unmark: function( force, elem, type ) {
            if ( force !== true ) {
                type = elem;
                elem = force;
                force = false;
            }
            if ( elem ) {
                type = type || "fx";
                var key = type + "mark",
                    count = force ? 0 : ( ($._data( elem, key ) || 1) - 1 );
                if ( count ) {
                    $._data( elem, key, count );
                } else {
                    $.removeData( elem, key, true );
                    handleQueueMarkDefer( elem, type, "mark" );
                }
            }
        }

    });

    jQ.fx.prototype = {
        // Simple function for setting a style value
        update: function() {
            if ( this.options.step ) {
                this.options.step.call( this.elem, this.now, this );
            }

            ( jQ.fx.step[ this.prop ] || jQ.fx.step._default )( this );
        },

        // Get the current size
        cur: function() {
            if ( this.elem[ this.prop ] != null && (!this.elem.style || this.elem.style[ this.prop ] == null) ) {
                return this.elem[ this.prop ];
            }

            var parsed,
                r = $.css( this.elem, this.prop );
            // Empty strings, null, undefined and "auto" are converted to 0,
            // complex values such as "rotate(1rad)" are returned as is,
            // simple values such as "10px" are parsed to Float.
            return isNaN( parsed = parseFloat( r ) ) ? !r || r === "auto" ? 0 : r : parsed;
        },

        // Start an animation from one number to another
        custom: function( from, to, unit ) {
            var self = this,
                fx = jQ.fx;

            this.startTime = fxNow || createFxNow();
            this.end = to;
            this.now = this.start = from;
            this.pos = this.state = 0;
            this.unit = unit || this.unit || ( $.cssNumber[ this.prop ] ? "" : "px" );

            function t( gotoEnd ) {
                return self.step( gotoEnd );
            }

            t.queue = this.options.queue;
            t.elem = this.elem;
            t.saveState = function() {
                if ( self.options.hide && $._data( self.elem, "fxshow" + self.prop ) === undefined ) {
                    $._data( self.elem, "fxshow" + self.prop, self.start );
                }
            };

            if ( t() && $.timers.push(t) && !timerId ) {
                timerId = setInterval( fx.tick, fx.interval );
            }
        },

        // Simple 'show' function
        show: function() {
            var dataShow = $._data( this.elem, "fxshow" + this.prop );

            // Remember where we started, so that we can go back to it later
            this.options.orig[ this.prop ] = dataShow || $.style( this.elem, this.prop );
            this.options.show = true;

            // Begin the animation
            // Make sure that we start at a small width/height to avoid any flash of content
            if ( dataShow !== undefined ) {
                // This show is picking up where a previous hide or show left off
                this.custom( this.cur(), dataShow );
            } else {
                this.custom( this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur() );
            }

            // Start by showing the element
            $( this.elem ).show();
        },

        // Simple 'hide' function
        hide: function() {
            // Remember where we started, so that we can go back to it later
            this.options.orig[ this.prop ] = $._data( this.elem, "fxshow" + this.prop ) || $.style( this.elem, this.prop );
            this.options.hide = true;

            // Begin the animation
            this.custom( this.cur(), 0 );
        },

        // Each step of an animation
        step: function( gotoEnd ) {
            var p, n, complete,
                t = fxNow || createFxNow(),
                done = true,
                elem = this.elem,
                options = this.options;

            if ( gotoEnd || t >= options.duration + this.startTime ) {
                this.now = this.end;
                this.pos = this.state = 1;
                this.update();

                options.animatedProperties[ this.prop ] = true;

                for ( p in options.animatedProperties ) {
                    if ( options.animatedProperties[ p ] !== true ) {
                        done = false;
                    }
                }

                if ( done ) {
                    // Reset the overflow
                    if ( options.overflow != null && !$.support.shrinkWrapBlocks ) {

                        $.each( [ "", "X", "Y" ], function( index, value ) {
                            elem.style[ "overflow" + value ] = options.overflow[ index ];
                        });
                    }

                    // Hide the element if the "hide" operation was done
                    if ( options.hide ) {
                        $( elem ).hide();
                    }

                    // Reset the properties, if the item has been hidden or shown
                    if ( options.hide || options.show ) {
                        for ( p in options.animatedProperties ) {
                            $.style( elem, p, options.orig[ p ] );
                            $.removeData( elem, "fxshow" + p, true );
                            // Toggle data is no longer needed
                            $.removeData( elem, "toggle" + p, true );
                        }
                    }

                    // Execute the complete function
                    // in the event that the complete function throws an exception
                    // we must ensure it won't be called twice. #5684

                    complete = options.complete;
                    if ( complete ) {

                        options.complete = false;
                        complete.call( elem );
                    }
                }

                return false;

            } else {
                // classical easing cannot be used with an Infinity duration
                if ( options.duration == Infinity ) {
                    this.now = t;
                } else {
                    n = t - this.startTime;
                    this.state = n / options.duration;

                    // Perform the easing function, defaults to swing
                    this.pos = jQ.easing[ options.animatedProperties[this.prop] ]( this.state, n, 0, 1, options.duration );
                    this.now = this.start + ( (this.end - this.start) * this.pos );
                }
                // Perform the next step of the animation
                this.update();
            }

            return true;
        }
    };

    $.extend( jQ.fx, {
        tick: function() {
            var timer,
                timers = $.timers,
                i = 0;

            for ( ; i < timers.length; i++ ) {
                timer = timers[ i ];
                // Checks the timer has not already been removed
                if ( !timer() && timers[ i ] === timer ) {
                    timers.splice( i--, 1 );
                }
            }

            if ( !timers.length ) {
                jQ.fx.stop();
            }
        },

        interval: 13,

        stop: function() {
            clearInterval( timerId );
            timerId = null;
        },

        speeds: {
            slow: 600,
            fast: 200,
            // Default speed
            _default: 400
        },

        step: {
            opacity: function( fx ) {
                $.style( fx.elem, "opacity", fx.now );
            },

            _default: function( fx ) {
                if ( fx.elem.style && fx.elem.style[ fx.prop ] != null ) {
                    fx.elem.style[ fx.prop ] = fx.now + fx.unit;
                } else {
                    fx.elem[ fx.prop ] = fx.now;
                }
            }
        }
    });

    function handleQueueMarkDefer( elem, type, src ) {
        var deferDataKey = type + "defer",
            queueDataKey = type + "queue",
            markDataKey = type + "mark",
            defer = $._data( elem, deferDataKey );
        if ( defer &&
            ( src === "queue" || !$._data(elem, queueDataKey) ) &&
            ( src === "mark" || !$._data(elem, markDataKey) ) ) {
            // Give room for hard-coded callbacks to fire first
            // and eventually mark/queue something else on the element
            setTimeout( function() {
                if ( !$._data( elem, queueDataKey ) &&
                    !$._data( elem, markDataKey ) ) {
                    $.removeData( elem, deferDataKey, true );
                    defer.fire();
                }
            }, 0 );
        }
    }

    // Animations created synchronously will run synchronously
    function createFxNow() {
        setTimeout( clearFxNow, 0 );
        return ( fxNow = $.now() );
    }

    function clearFxNow() {
        fxNow = undefined;
    }

    // Generate parameters to create a standard animation
    function genFx( type, num ) {
        var obj = {};

        $.each( fxAttrs.concat.apply([], fxAttrs.slice( 0, num )), function() {
            obj[ this ] = type;
        });

        return obj;
    }

})(jQuery);
