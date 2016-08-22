/**
 * Copyright (C) 2016 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'underscore',
    'marionette',
    'apps/settings/show/formBehavior',
    'text!apps/settings/show/templates/editor.html'
], function(_, Marionette, FormBehavior, Tmpl) {
    'use strict';

    /**
     * Note editor settings
     */
    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        behaviors: {
            FormBehavior: {
                behaviorClass: FormBehavior
            }
        },

        serializeData: function() {
            return { models: this.collection.getConfigs() };
        }
    });

    return View;
});
