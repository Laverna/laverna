/*global define */
define([
    'underscore',
    'app',
    'marionette',
    'text!apps/notebooks/list/templates/layout.html',
    'backbone.mousetrap'
], function (_, App, Marionette, Templ) {
    'use strict';

    // Initializing mousetrap
    _.extend(Marionette.Layout, Backbone.View);

    var Layout = Marionette.Layout.extend({
        template: _.template(Templ),

        regions: {
            notebooks :  '#notebooks',
            tags      :  '#tags'
        },
        
        keyboardEvents: {
        }
    });

    return Layout;
});
