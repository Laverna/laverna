/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'apps/help/about/view'
], function(_, Marionette, Radio, View) {
    'use strict';

    var Controller = Marionette.Object.extend({

        initialize: function() {
            this.view = new View({
                appVersion: '0.5'
            });

            Radio.request('global', 'region:show', 'modal', this.view);
            this.listenTo(this.view, 'redirect', this.destroy);
        },

        onDestroy: function() {
            Radio.request('global', 'region:empty', 'modal');
        }

    });

    return Controller;
});
