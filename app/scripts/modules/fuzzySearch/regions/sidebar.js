/*global define*/
define([
    'underscore',
    'jquery',
    'marionette'
], function (_, $, Marionette) {
    'use strict';

    var SidebarRegion = Marionette.Region.extend({
        el : '#fuzzy-sidebar',

        onShow: function () {
            this.$body = this.$body || $('body');
            this.$body.addClass('fuzzy-search');
            this.$el.removeClass('hidden');
        },

        onEmpty: function () {
            this.$el.addClass('hidden');
            this.$body.removeClass('fuzzy-search');
        }

    });

    return SidebarRegion;
});
