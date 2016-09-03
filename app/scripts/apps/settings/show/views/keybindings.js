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
    'apps/settings/show/formBehavior',
    'text!apps/settings/show/templates/keybindings.html'
], function(_, Marionette, FormBehavior, Tmpl) {
    'use strict';

    /**
     * Keybinding settings
     */
    var Shortcuts = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        behaviors: {
            FormBehavior: {
                behaviorClass: FormBehavior
            }
        },

        serializeData: function() {
            return { collection: this.collection };
        },

        templateHelpers: function() {
            return {
                filter: function(str) {
                    return this.collection.filterName(str);
                },

                appShortcuts: function() {
                    return this.collection.appShortcuts();
                }
            };
        }
    });

    return Shortcuts;
});
