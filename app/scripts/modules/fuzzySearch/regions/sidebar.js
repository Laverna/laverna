/**
 * Copyright (C) 2015 Laverna project Authors.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
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
