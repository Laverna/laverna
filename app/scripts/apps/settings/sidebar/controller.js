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
