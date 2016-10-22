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
    'q',
    'marionette',
    'backbone.radio',
    'behaviors/sidebar',
    'text!apps/settings/sidebar/template.html'
], function(_, Q, Marionette, Radio, Behavior, Tmpl) {
    'use strict';

    /**
     * Sidebar view for settings
     */
    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        behaviors: {
            SidebarBehavior: {
                behaviorClass: Behavior
            }
        },

        events: {
            'click a': 'confirm'
        },

        serializeData: function() {
            return {
                uri: Radio.request('uri', 'link:profile', '')
            };
        },

        initialize: function() {
            Radio.channel('AppSettings')
            .reply('activate:tab', this.activateTab, this);
        },

        onDestroy: function() {
            Radio.channel('AppSettings')
            .stopReplying('activate:tab');
        },

        onRender: function() {
            this.activateTab(this.options.tab);
        },

        /**
         * Before navigating to another page, ask for confirmation.
         */
        confirm: function(e) {
            e.preventDefault();

            Radio.request('AppSettings', 'has:changes')
            .then(function() {
                Radio.request('uri', 'navigate', $(e.currentTarget).attr('href'));
            });
        },

        activateTab: function(tab) {
            this.$('.active').removeClass('active');
            this.$('[href*=' + tab + ']').addClass('active');
        }
    });

    return View;
});
