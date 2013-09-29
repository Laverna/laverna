/*global define*/
define(['underscore', 'jquery', 'marionette'],
function (_, $, Marionette) {
    'use strict';

    var Bindings = {
        shortcuts: {},
        ignoreKeys: [
            91, // Command (osx)
            16, // shift (osx)
            17  // control (osx)
        ],

        getShortcut: function (e) {
            var key = e.which,
                // key = e.keyCode,
                methods = this.shortcuts,
                // ignore = this.ignoreKeys,
                ctrl = e.ctrlKey,
                meta = e.metaKey;

            console.log(key);
            if (methods[key] && !meta && !ctrl) {
                e.stopPropagation();
                return this[methods[key]]();
            }
            return e;
        },

        enableShortcut: function () {
            this.$document = $(document);
            _.bindAll(this, 'getShortcut');
            this.$document.bind('keydown', this.getShortcut);
            return this;
        },

        /**
         * Disable shortcuts
         */
        disableShortcut: function () {
            this.$document.unbind('keydown', 'getShortcut');
            return this;
        }
    };

    return {
        ItemView: Marionette.ItemView.extend(_.clone(Bindings)),
        CompositeView: Marionette.CompositeView.extend(Bindings)
    };
});

