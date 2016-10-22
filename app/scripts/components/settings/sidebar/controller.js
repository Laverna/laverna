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
    'marionette',
    'backbone.radio',
    'apps/settings/sidebar/view',
    'apps/settings/sidebar/views/navbar'
], function(_, Marionette, Radio, View, Navbar) {
    'use strict';

    /**
     * Sidebar controller for settings module
     */
    var Controller = Marionette.Object.extend({

        initialize: function(options) {
            this.options = options;
            this.show();
        },

        onDestroy: function() {
            this.stopListening();
            this.view.trigger('destroy');
            Radio.request('global', 'region:empty', 'sidebarNavbar');
        },

        show: function() {
            this.view = new View(this.options);
            Radio.request('global', 'region:show', 'sidebar', this.view);

            // Show a different Navbar
            Radio.request('navbar', 'stop');
            Radio.request('global', 'region:show', 'sidebarNavbar', new Navbar());
        }

    });

    return Controller;
});
