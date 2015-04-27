/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'apps/settings/sidebar/view'
], function(_, Marionette, Radio, View) {
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
        },

        show: function() {
            this.view = new View(this.options);
            Radio.command('global', 'region:show', 'sidebar', this.view);
        }

    });

    return Controller;
});
