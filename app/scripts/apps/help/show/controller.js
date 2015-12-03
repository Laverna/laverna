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
    'apps/help/show/view'
], function(_, Marionette, Radio, View) {
    'use strict';

    /**
     * Keybindings help controller.
     */
    var Controller = Marionette.Object.extend({

        initialize: function() {
            _.bindAll(this, 'show');

            // Fetch configs
            Radio.request('configs', 'get:all', {
                profile: Radio.request('uri', 'profile')
            }).then(this.show);
        },

        onDestroy: function() {
            Radio.request('global', 'region:empty', 'modal');
        },

        show: function(configs) {
            configs = configs.clone();
            configs.reset(configs.shortcuts());

            this.view = new View({
                collection: configs
            });

            Radio.request('global', 'region:show', 'modal', this.view);
            this.listenTo(this.view, 'redirect', this.destroy);
        }

    });

    return Controller;
});
