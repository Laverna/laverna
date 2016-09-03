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
    'text!apps/settings/show/templates/modules.html'
], function(_, Marionette, Radio, Tmpl) {
    'use strict';

    /**
     * Sync settings.
     */
    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        events: {
            'click .-enable'  : 'toggle',
            'click .-disable' : 'toggle',
        },

        serializeData: function() {
            return {
                active  : this.collection.get('modules').get('value'),
                modules : this.options.modules
            };
        },

        templateHelpers: function() {
            return {
                isEnabled: function(module) {
                    return _.indexOf(this.active, module.id) > -1;
                }
            };
        },

        initialize: function() {
            this.options.modules = Radio.request('global', 'modules');
        },

        /**
         * Enable or disable a module.
         */
        toggle: function(e) {
            var id      = $(e.currentTarget).attr('data-id'),
                configs = this.collection.get('modules').get('value'),
                self    = this;

            e.preventDefault();

            if (_.indexOf(configs, id) === -1) {
                configs.push(id);
            }
            else {
                configs = _.without(configs, id);
            }

            // Save the list of modules
            Radio.request('configs', 'save', this.collection.get('modules'), {value: configs})
            .then(function() {
                self.render();
            });
        }

    });

    return View;
});
