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
    'q',
    'marionette',
    'backbone.radio',
    'collections/modules/module',
    'collections/notebooks'
], function(_, Q, Marionette, Radio, ModuleObject, Notebooks) {
    'use strict';

    /**
     * Collection module for Notebooks.
     * A convenience object that handles operations to Notebooks collection.
     *
     * It listens to all events and replies registered in collections/modules/module.js
     */
    var Collection = ModuleObject.extend({
        Collection: Notebooks,

        /**
         * Remove an existing notebook.
         * @type object Backbone model
         * @type object options
         * @type boolean true if all attached notes should be removed
         */
        remove: function(model, options, remove) {
            var self = this;

            if (typeof model === 'string') {
                model = this.getModel(_.extend({id: model}, options));
            }

            /**
             * Move child models to a higher level.
             * Then, remove notes attached to the notebook or change their notebookId.
             * And finally, remove the notebook.
             */
            return new Q(model)
            .then(function(model) {
                return self.updateChildren(model).thenResolve(model);
            })
            .then(function(model) {
                return Radio.request('notes', 'change:notebookId', model, remove)
                .thenResolve(model);
            })
            .then(function(model) {
                var removeFunc = _.bind(ModuleObject.prototype.remove, self);
                return removeFunc(model, options);
            });
        },

        /**
         * Move child models to a higher level.
         * @type object Backbone model
         */
        updateChildren: function(model) {
            var self = this;

            return this.getChildren(model.id, {profile: model.profileId})
            .then(function(collection) {
                var promises = [];

                // Change parentId of each children
                collection.each(function(child) {
                    promises.push(new Q(
                        self.saveModel(child, {parentId: model.get('parentId')})
                    ));
                });

                return Q.all(promises);
            });
        },

        /**
         * Returns models with the specified parent ID.
         * @type string
         */
        getChildren: function(parentId, options) {
            // Just filter an existing collection
            if (this.collection) {
                var collection = this.collection.clone();
                collection.reset(collection.getChildren(parentId));
                return Q.resolve(collection);
            }

            return this.fetch(_.extend(
                {conditions: {parentId: parentId}},
                options || {}
            ));
        },

        /**
         * Get all notebooks.
         * @type object options
         */
        getAll: function(options) {
            var self      = this,
                sortField = Radio.request('configs', 'get:config', 'sortnotebooks');

            options.profile = options.profile || this.defaultDB;
            options.filter  = options.filter || 'active';

            // Do not fetch twice
            if (this.collection && this.collection.profileId === options.profile) {
                this.collection.models = this.collection.getTree();
                return new Q(
                    this.collection
                );
            }

            var getFunc = _.bind(ModuleObject.prototype.getAll, this);
            this.Collection.prototype.sortField = sortField;

            return getFunc(options)
            .then(function() {
                self.collection.models = self.collection.getTree();
                return self.collection;
            });
        },

    });

    // Initialize it automaticaly
    Radio.request('init', 'add', 'app:before', function() {
        new Collection();
    });

    return Collection;
});
