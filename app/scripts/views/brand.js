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
            this.$el.addClass('in');
        },

        onClose: function () {
            this.$el.removeClass('in');
            $('#wrapper').show();
        }

    });

    return BrandRegion;
});
