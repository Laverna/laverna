/*global define*/
/**
 * Keybindings
 */
define(['underscore', 'jquery'], function (_, $) {
    'use strict';

    var Keys = function () {
        this.$document = $(document);
    };

    _.extend(Keys.prototype, {
        keys: {},

        getShortcut: function (e) {
            var key = e.keyCode,
                methods = this.keys,
                ignore = this.ignoreKeys,
                ctrl = e.ctrlKey,
                meta = e.metaKey;

            methods.each(function () {
                return this[methods[key]]();
            });

            if (methods[key] && !ignore.indexOf(key) && !meta && !ctrl) {
                e.stopPropagation();
                return this[methods[key]]();
            }
            return e;
        },

        enable: function () {
            _.bindAll(this, 'on_keypress');
            this.$document.bind('keydown', this.getShortcut);
            return this;
        },

        /**
         * Disable shortcuts
         */
        disable: function () {
            this.$document.unbind('keydown', 'on_keypress');
            return this;
        }
    });

    return Keys;
});
