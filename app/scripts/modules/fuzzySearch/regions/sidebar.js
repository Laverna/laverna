/*global define*/
define([
    'underscore',
    'jquery',
    'marionette'
], function (_, $, Marionette) {
    'use strict';

    var SidebarRegion = Marionette.Region.extend({
        el : '#sidebar--fuzzy',

        onShow: function () {
            this.$body = this.$body || $('body');
            this.$body.addClass('-fuzzy');
            this.$el.removeClass('hidden');
        },

        onEmpty: function () {
            this.$el.addClass('hidden');
            this.$body.removeClass('-fuzzy');
        }

    });

    return SidebarRegion;
});
