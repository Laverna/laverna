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
    'collections/tags'
], function(_, Q, Marionette, Radio, ModuleObject, Tags) {
    'use strict';

    /**
     * Collection module for Tags.
     *
     * Apart from the replies in collections/modules/module.js,
     * it also has an additional reply `add` which inserts several
     * tags into database.
     */
    var Collection = ModuleObject.extend({
        Collection: Tags,

        reply: function() {
            return {
                'add': this.addTags,
            };
        },

        /**
         * Add a bunch of tags.
         * @type array array of tags
         * @type object options
         */
        addTags: function(tags, options) {
            var self     = this,
                promises = [];

            if (!tags.length) {
                return new Q();
            }

            options = options || {};
            _.each(tags, function(tag) {
                promises.push(function() {
                    return self.addTag(tag, options);
                });
            });

            return _.reduce(promises, Q.when, new Q())
            .fail(function(e) {
                console.error('Error:', e);
            });
        },

        /**
         * Add a tag.
         * @type string name of a tag
         * @type object options
         */
        addTag: function(tag, options) {
            var self = this;

            return new Q(Radio.request('encrypt', 'sha256', tag))
            .then(function(id) {
                options.id = id;
                return self.getModel({id: id.join(''), profile: options.profile});
            })
            .then(function(model) {
                if (!model || !model.get('name').length) {
                    model = new (self.changeDatabase(options)).prototype.model();
                    return self.saveModel(model, {name: tag});
                }
                return model;
            });
        },

        /**
         * Save or create a tag.
         * @type object Backbone model
         * @type object new values
         */
        saveModel: function(model, data) {
            var self   = this,
                errors = model.validate(data);

            if (errors) {
                model.trigger('invalid', model, errors);
                return Q.reject('Validation error: tags', errors);
            }

            // First, make sure that a model won't duplicate itself.
            return new Q(Radio.request('encrypt', 'sha256', data.name))
            .then(function(id) {
                id = id.join('');

                if (!model.id) {
                    return id;
                }

                return self.remove(model, {profile: model.profileId})
                .thenResolve(id);
            })
            .then(function(id) {
                var saveFunc = _.bind(ModuleObject.prototype.saveModel, self);
                model.set(data);
                model.set('id', id);

                return saveFunc(model, model.attributes);
            });
        },

    });

    // Initialize the collection automaticaly
    Radio.request('init', 'add', 'app:before', function() {
        new Collection();
    });

    return Collection;
});
