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
    'modules/fs/classes/adapter'
], function(_, Q, Marionette, Radio, FS) {
    'use strict';

    /**
     * File system synchronizer.
     */
    var Controller = Marionette.Object.extend({

        initialize: function() {

            FS.path = Radio.request('configs', 'get:config', 'module:fs:folder');

            /**
             * @todo Show a message or something.
             * For now disable synchronizing.
             */
            if (!FS.path) {
                return;
            }

            // Create current profile's folder
            FS.path = FS.path + '/' + (Radio.request('uri', 'profile') || 'notes-db') + '/';
            FS.checkDirs();

            // Check for changes on file system
            this.checkChanges();

            // Listen to Laverna events
            this.listenTo(Radio.channel('notes'), 'sync:model destroy:model restore:model', this.onSave);
            this.listenTo(Radio.channel('notebooks'), 'sync:model destroy:model restore:model', this.onSave);
            this.listenTo(Radio.channel('tags'), 'sync:model destroy:model restore:model', this.onSave);

            // Listen to FS events
            this.listenTo(Radio.channel('fs'), 'change', this.onFsChange);
        },

        /**
         * Check for changes on start.
         */
        checkChanges: function() {
            var promises = [],
                self     = this;

            _.each(['notes', 'notebooks', 'tags'], function(module) {
                return Q.all([
                    Radio.request(module, 'fetch', {encrypt: true}),
                    FS.getList(module)
                ])
                .spread(function(localData, remoteData) {
                    return self.syncAll(localData, remoteData, module);
                });
            });

            return _.reduce(promises, Q.when, new Q())
            .then(function() {
                self.startWatch();
            })
            .fail(function(e) {
                console.error('Error:', e);
            });
        },

        /**
         * Start watching for FS changes.
         */
        startWatch: function() {
            FS.startWatch();
        },

        /**
         * Synchronize FS and IndexedDB.
         */
        syncAll: function(localData, remoteData, module) {
            var promises = [];

            localData = (localData.fullCollection || localData).toJSON();

            // First, check if there are any changes in IndexedDB
            promises.push.apply(
                promises,
                this.checkLocalChanges(localData, remoteData, module)
            );

            // Then, check if there are any changes on file system
            promises.push.apply(
                promises,
                this.checkRemoteChanges(localData, remoteData, module)
            );

            return _.reduce(promises, Q.when, new Q())
            .fail(function(e) {
                console.error('Error:', e);
            });
        },

        /**
         * Synchronize models from IndexedDB to file system.
         */
        checkLocalChanges: function(localData, remoteData, module) {
            var promises = [];

            _.each(localData, function(lModel) {
                var model = _.findWhere(remoteData, {id: lModel.id});
                if (model && model.updated >= lModel.updated) {
                    return;
                }

                promises.push(function() {
                    return FS.writeFile(module, lModel);
                });
            });

            return promises;
        },

        /**
         * Synchronize models from file system to IndexedDB.
         */
        checkRemoteChanges: function(localData, remoteData, module) {
            var newData = _.filter(remoteData, function(rModel) {
                var model = _.findWhere(localData, {id: rModel.id});
                rModel.content = rModel.content || '';

                if (model && model.updated >= rModel.updated &&
                   _.isEqual(rModel, model)) {
                    return false;
                }

                return true;
            });

            return Radio.request(module, 'save:all:raw', newData);
        },

        /**
         * Laverna triggered `change` event.
         */
        onSave: function(model) {
            FS.writeFile(model.storeName, model.attributes)
            .fail(function(e) {
                console.error('onSave error:', e);
            });
        },

        /**
         * File system triggered `change` event.
         */
        onFsChange: function(data) {

            return Radio.request(data.storeName, 'get:model', {
                id: data.data.id
            })
            .then(function(model) {
                data.data = _.extend({}, model.attributes, data.data);

                // Don't parse content
                if (!data.data.content) {
                    return [data, model];
                }

                // Parse tasks and tags
                return Radio.request('markdown', 'parse', data.data.content)
                .then(function(env) {
                    data.data = _.extend(
                        data.data,
                        _.pick(env, 'tags', 'tasks', 'taskCompleted', 'taskAll', 'files')
                    );

                    return [data, model];
                });
            })
            .spread(function(data, model) {

                // Nothing's changed
                if (_.isEqual(data.data, model.attributes)) {
                    return;
                }

                return Radio.request(data.storeName, 'save:raw', data.data);
            })
            .fail(function(e) {
                console.error('onFsChange error:', e);
            });
        },

    });

    return Controller;
});
