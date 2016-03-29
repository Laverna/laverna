/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define, requirejs */
define([
    'q',
    'underscore',
    'marionette',
    'backbone.radio',
    'apps/settings/controller',
], function(Q, _, Marionette, Radio, BasicController) {
    'use strict';

    /**
     * Module configs.
     */
    var Controller = BasicController.extend({

        /**
         * Show layout view and load a module view
         */
        requireView: function() {
            requirejs(['modules/' + this.options.module + '/views/settings'], this.show);
        },

        redirect: function() {
            Radio.request('uri', 'navigate', '/settings/modules', {
                trigger        : false,
                includeProfile : true
            });
            window.location.reload();
        },

    });

    return Controller;
});
