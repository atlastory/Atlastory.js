// Adapted from Leaflet Events

var Avents = {};
var eventsKey = '_atlastory_events';

// Mix events into the prototype

Avents.apply = function(object) {
    if (object.prototype) {
        object.prototype = L.Util.extend(object.prototype, Avents.Events);
    } else {
        object = L.Util.extend(object, Avents.Events);
    }
};

// Utilities

Avents._stamp = (function () {
    var lastId = 0, key = '_atlastory_events';
    return function (/*Object*/ obj) {
        obj[key] = obj[key] || ++lastId;
        return obj[key];
    };
}());

Avents._invoke = function (obj, method, context) {
    var i, args;
    if (typeof obj === 'object') {
        args = Array.prototype.slice.call(arguments, 3);
        for (i in obj) {
            method.apply(context, [i, obj[i]].concat(args));
        }
        return true;
    }
    return false;
};

function falseFn() {
    return false;
}

// Events

Avents.Events = {

    addEventListener: function (types, fn, context) { // (String, Function[, Object]) or (Object[, Object])

        // types can be a map of types/handlers
        if (Avents._invoke(types, this.addEventListener, this, fn, context)) { return this; }

        var events = this[eventsKey] = this[eventsKey] || {},
            contextId = context && Avents._stamp(context),
            i, len, event, type, indexKey, indexLenKey, typeIndex;

        // types can be a string of space-separated words
        types = types.replace(/^\s+|\s+$/g,'').split(/\s+/);

        for (i = 0, len = types.length; i < len; i++) {
            event = {
                action: fn,
                context: context || this
            };
            type = types[i];

            if (context) {
                // store listeners of a particular context in a separate hash (if it has an id)
                // gives a major performance boost when removing thousands of map layers

                indexKey = type + '_idx',
                indexLenKey = indexKey + '_len',

                typeIndex = events[indexKey] = events[indexKey] || {};

                if (!typeIndex[contextId]) {
                    typeIndex[contextId] = [];

                    // keep track of the number of keys in the index to quickly check if it's empty
                    events[indexLenKey] = (events[indexLenKey] || 0) + 1;
                }

                typeIndex[contextId].push(event);


            } else {
                events[type] = events[type] || [];
                events[type].push(event);
            }
        }

        return this;
    },

    hasEventListeners: function (type) { // (String) -> Boolean
        var events = this[eventsKey];
        return !!events && ((type in events && events[type].length > 0) ||
                            (type + '_idx' in events && events[type + '_idx_len'] > 0));
    },

    removeEventListener: function (types, fn, context) { // ([String, Function, Object]) or (Object[, Object])

        if (!this[eventsKey]) {
            return this;
        }

        if (!types) {
            return this.clearAllEventListeners();
        }

        if (Avents._invoke(types, this.removeEventListener, this, fn, context)) { return this; }

        var events = this[eventsKey],
            contextId = context && Avents._stamp(context),
            i, len, type, listeners, j, indexKey, indexLenKey, typeIndex, removed;

        types = types.replace(/^\s+|\s+$/g,'').split(/\s+/);

        for (i = 0, len = types.length; i < len; i++) {
            type = types[i];
            indexKey = type + '_idx';
            indexLenKey = indexKey + '_len';

            typeIndex = events[indexKey];

            if (!fn) {
                // clear all listeners for a type if function isn't specified
                delete events[type];
                delete events[indexKey];

            } else {
                listeners = context && typeIndex ? typeIndex[contextId] : events[type];

                if (listeners) {
                    for (j = listeners.length - 1; j >= 0; j--) {
                        if ((listeners[j].action === fn) && (!context || (listeners[j].context === context))) {
                            removed = listeners.splice(j, 1);
                            // set the old action to a no-op, because it is possible
                            // that the listener is being iterated over as part of a dispatch
                            removed[0].action = falseFn;
                        }
                    }

                    if (context && typeIndex && (listeners.length === 0)) {
                        delete typeIndex[contextId];
                        events[indexLenKey]--;
                    }
                }
            }
        }

        return this;
    },

    clearAllEventListeners: function () {
        delete this[eventsKey];
        return this;
    },

    trigger: function (type, data) { // (String[, Object])
        if (!this.hasEventListeners(type)) {
            return this;
        }

        var event = L.Util.extend({}, data, { type: type, target: this });

        var events = this[eventsKey],
            listeners, i, len, typeIndex, contextId;

        if (events[type]) {
            // make sure adding/removing listeners inside other listeners won't cause infinite loop
            listeners = events[type].slice();

            for (i = 0, len = listeners.length; i < len; i++) {
                listeners[i].action.call(listeners[i].context || this, event);
            }
        }

        // fire event for the context-indexed listeners as well
        typeIndex = events[type + '_idx'];

        for (contextId in typeIndex) {
            listeners = typeIndex[contextId];

            if (listeners) {
                for (i = 0, len = listeners.length; i < len; i++) {
                    listeners[i].action.call(listeners[i].context || this, event);
                }
            }
        }

        return this;
    },

    addOneTimeEventListener: function (types, fn, context) {

        if (Avents._invoke(types, this.addOneTimeEventListener, this, fn, context)) { return this; }

        var handler = L.Util.bind(function () {
            this
                .removeEventListener(types, fn, context)
                .removeEventListener(types, handler, context);
        }, this);

        return this
            .addEventListener(types, fn, context)
            .addEventListener(types, handler, context);
    }
};

// Shortcuts
Avents.Events.listen = Avents.Events.addEventListener;
Avents.Events.on = Avents.Events.addEventListener;
Avents.Events.off = Avents.Events.removeEventListener;
Avents.Events.once = Avents.Events.addOneTimeEventListener;
Avents.Events.fire = Avents.Events.trigger;

module.exports = Avents;
