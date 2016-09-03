/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'underscore',
    'jquery',
    'marionette',
    'backbone.radio'
], function(_, $, Marionette, Radio) {
    'use strict';

    /**
     * Sidebar region behaviour
     */
    var Sidebar = Marionette.Behavior.extend({

        defaults: {
            events: {
                'swipeleft'  : 'onSwipeLeft',
                'swiperight' : 'onSwipeRight',
            }
        },

        onRender: function() {
            var hammer = $('#sidebar--content').hammer();

            _.each(this.options.events, function(func, ev) {
                hammer.bind(ev, this.view[func] || this[func]);
            }, this);
        },

        /**
         * Show sidemenu.
         */
        onSwipeRight: function() {
            Radio.trigger('sidemenu', 'show');
        },

        /**
         * Switch to content region (hide sidebar).
         */
        onSwipeLeft: function() {
            Radio.trigger('region', 'content:shown');
        },

    });

    return Sidebar;

});
