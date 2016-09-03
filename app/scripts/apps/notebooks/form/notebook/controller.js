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
    'apps/notebooks/form/notebook/formView'
], function(Q, _, Marionette, Radio, View) {
    'use strict';

    /**
     * Notebook form controller.
     *
     * Listens to events:
     * 1. channel: `notebooks`, event: `update:model`
     *    triggers `close` event on the view.
     * 2. this.view, event: `save`
     *    saves the changes.
     * 3. this.view, event: `redirect`
     *    stops the module and redirects.
     *
     * requests:
     * 1. channel: `notebooks`, event: `save`
     * 2. channel: `uri`, event: `back`
     * 3. channel: `appNotebooks`, event: `form:stop`
     */
    var Controller = Marionette.Object.extend({

        initialize: function(options) {
            options.profile = options.profile || Radio.request('uri', 'profile');

            _.bindAll(this, 'show');
            this.options = options;

            // Events
            this.listenTo(Radio.channel('notebooks'), 'update:model', this.onSaveAfter);

            // Fetch notebooks
            Q.all([
                Radio.request('notebooks', 'get:all', options),
                Radio.request('notebooks', 'get:model', options)
            ])
            .spread(this.show);
        },

        onDestroy: function() {
            this.stopListening();
            Radio.request('global', 'region:empty', 'modal');

            // If we still got an unresolved promise, resolve it with null-value.
            if (this.options.promise) {
               this.options.promise.resolve(null);
            }
        },

        show: function(collection, model) {
            // Show only notebooks which are not related to the current model.
            collection = collection.clone();
            collection.reset(collection.rejectTree(model.get('id')));

            // Instantiate and show the form view
            this.view = new View({
                collection : collection,
                model      : model
            });

            Radio.request('global', 'region:show', 'modal', this.view);

            // Listen to events
            this.listenTo(this.view, 'save'    , this.save);
            this.listenTo(this.view, 'redirect', this.redirect);
        },

        save: function() {
            var self = this,
                data = {
                    name     : this.view.ui.name.val(),
                    parentId : this.view.ui.parentId.val()
                };

            Radio.request('notebooks', 'save', this.view.model, data)
            .then(function() {
                // Resolve the promise.
                if (self.options.promise) {
                    self.options.promise.resolve({
                        title: self.view.model.title,
                        id: self.view.model.id
                    });
                    self.options.promise = null;
                }
            })
            .fail(function(e) {
                console.error('Error:', e);
                if (self.options.promise) {
                    self.options.promise.reject(e);
                    self.options.promise = null;
                }
            });
        },

        onSaveAfter: function() {
            this.view.trigger('close');
        },

        redirect: function() {
            var moduleName = Radio.request('global', 'app:current').moduleName;

            // Stop itself
            Radio.request('appNotebooks', 'form:stop');

            // Redirect only if current active module is AppNotebooks
            if (moduleName === 'AppNotebooks') {
                Radio.request('uri', 'back', '/notebooks', {
                    includeProfile : true
                });
            }
        }

    });

    return Controller;
});
