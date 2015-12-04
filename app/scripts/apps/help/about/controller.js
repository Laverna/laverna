/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'apps/help/about/view',
    'constants'
], function(_, Marionette, Radio, View, constants) {
    'use strict';

    var Controller = Marionette.Object.extend({

        initialize: function() {
            this.view = new View({
                appVersion: constants.VERSION
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
