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
    'backbone',
    'marionette'
], function (_, $, Backbone) {
    'use strict';

    var BrandRegion = Backbone.Marionette.Region.extend({
        el : '#layout--brand',

        onShow: function () {
            // this.$el.html(view.el);
            this.$el.slideDown('fast');
        },

        onEmpty: function () {
            this.$el.slideUp('fast');
        }

    });

    return BrandRegion;
});
