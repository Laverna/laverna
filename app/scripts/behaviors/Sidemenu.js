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
    'backbone.radio',
    'mousetrap'
], function(_, $, Marionette, Radio, Mousetrap) {
    'use strict';

    /**
     * This behaviour can be used for views which need to show
     * hamburger type of menu.
     */
    var Sidemenu = Marionette.Behavior.extend({

        ui: {
            sidemenu: '.sidemenu'
        },

        defaults: {
            events: {
                'swipeleft'  : 'hideMenu',
            }
        },

        events: {
            'click .sidemenu--open'  : 'showMenu',
            'click .sidemenu--close' : 'hideMenu',
            'click .sidemenu a'      : 'hideMenu'
        },

        initialize: function() {
            this.listenTo(Radio.channel('sidemenu'), 'show', this.showMenu);
        },

        onRender: function() {

            // To avoid bugginess, add hammer events to the backdrop el too
            var hammer  = $('.layout--backdrop').hammer(),
                hammer2 = this.$el.hammer();

            _.each(this.options.events, function(func, ev) {
                hammer.bind(ev,  _.bind(this.view[func] || this[func], this));
                hammer2.bind(ev, _.bind(this.view[func] || this[func], this));
            }, this);
        },

        onShow: function() {
            _.bindAll(this, 'hideMenu');

            this.$backdrop = $('#layout--backdrop');

            // Hide when 'Esc' was pressed
            Mousetrap.bind('esc', this.hideMenu);
        },

        hideMenu: function() {
            this.ui.sidemenu.removeClass('-show');
            this.$backdrop.removeClass('-show');
        },

        showMenu: function() {
            var self = this;

            // Show the menu and backdrop
            this.ui.sidemenu.addClass('-show');
            this.$backdrop.addClass('-show');

            this.ui.sidemenu.scrollTop(0);

            // Hide the menu when a user clicks on the backdrop area
            this.$backdrop.on('click', function() {
                self.$backdrop.off('click');
                self.hideMenu();
            });

            return false;
        }

    });

    return Sidemenu;
});
