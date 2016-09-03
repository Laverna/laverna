/**
 * Copyright (C) 2015 Laverna project Authors.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'q',
    'underscore',
    'marionette',
    'backbone.radio',
    'apps/notebooks/form/tag/formView'
], function(Q, _, Marionette, Radio, View) {
    'use strict';

    /**
     * Tag form controller.
     *
     * Listens to events:
     * 1. channel: `tags`, event: `update:model`
     *    triggers `close` event on the view.
     * 2. this.view, event: `save`
     *    saves the changes.
     * 3. this.view, event: `redirect`
     *    stops the module and redirects.
     *
     * requests:
     * 1. channel: `tags`, event: `save`
     * 2. channel: `uri`, event: `back`
     * 3. channel: `appNotebooks`, event: `form:stop`
     */
    var Controller = Marionette.Object.extend({

        initialize: function(options) {
            _.bindAll(this, 'show');

            // Events
            this.listenTo(Radio.channel('tags'), 'update:model', this.onSaveAfter);

            // Fetch the model and render the view
            Radio.request('tags', 'get:model', options)
            .then(this.show);
        },

        onDestroy: function() {
            this.stopListening();
            Radio.request('global', 'region:empty', 'modal');
        },

        show: function(model) {
            // Instantiate and show the form view
            this.view = new View({
                model: model
            });

            Radio.request('global', 'region:show', 'modal', this.view);

            // Listen to events
            this.listenTo(this.view, 'save'    , this.save);
            this.listenTo(this.view, 'redirect', this.redirect);
        },

        save: function() {
            var data = {
                name: this.view.ui.name.val().trim()
            };

            Radio.request('tags', 'save', this.view.model, data)
            .fail(function(e) {
                console.error('Error:', e);
            });
        },

        onSaveAfter: function() {
            this.view.trigger('close');
        },

        redirect: function() {
            Radio.request('appNotebooks', 'form:stop');

            Radio.request('uri', 'back', '/notebooks', {
                includeProfile : true
            });
        }

    });

    return Controller;
});
