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

        onShow: function () {
            $('#wrapper').hide();
            // this.$el.html(view.el);
            this.$el.slideDown('fast');
        },

        onEmpty: function () {
            this.$el.slideUp('fast');
            $('#wrapper').show();
        }

    });

    return BrandRegion;
});
