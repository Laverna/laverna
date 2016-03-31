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
    'modules/electronSearch/view'
], function(_, Marionette, Radio, View) {
    'use strict';

    return Marionette.Object.extend({

        initialize: function() {

            // Create a new region
            Radio.request('global', 'region:add', 'module--electronSearch');

            // Render the view
            this.view = new View({});
            Radio.request('global', 'region:show', 'module--electronSearch', this.view);
            this.view.trigger('rendered');

            // Destroy the controller
            this.view.on('destroy', this.destroy, this);
        }

    });

});
