/*global define*/
define([
    'underscore',
    'jquery',
    'backbone',
    'marionette'
], function (_, $, Backbone) {
    'use strict';

    var BrandRegion = Backbone.Marionette.Region.extend({
        el : '#brand-layer',

        open: function (view) {
            $('#wrapper').hide();

            this.$el.html(view.el);
            this.$el.slideDown('fast');
        },

        onDestroy: function () {
            this.$el.slideUp('fast');
            $('#wrapper').show();
        }

    });

    return BrandRegion;
});
