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
    'q',
    'modules/remotestorage/classes/rs',
    'modules/remotestorage/classes/module'
], function(_, Marionette, Radio, Q, RS, RsModule) {
    'use strict';

    /**
     * RemoteStorage sync controller.
     *
     * Listens to events:
     * 1. event: `save:after:encrypted`, channel: [notes|notebooks|tags]
     *    syncs changes to RemoteStorage.
     * 2. `RemoteStorage`, event: `ready`
     *    syncs local and remote changes.
     * 3. `RemoteStorage`, event: `change`
     *    syncs remote data to local storage.
     *
     * Triggers:
     * 1. channel: [notes|notebooks|tags], request: 'save:raw'
     *    passes new changes to a model.
     * 2. channel: [notes|notebooks|tags], request: 'fetch'
     *    expects to get a collection of notes,notebooks, or tags.
     * 3. channel: [notes|notebooks|tags], request: 'save:all:raw'
     *    passes new models.
     */
    var Sync = Marionette.Object.extend({

        initialize: function() {
            _.bindAll(this, 'onReady', 'syncAll', 'onRsChange');

            RS.access.claim('laverna', 'rw');
            RS.displayWidget();

            // Listen to RemoteStorage events
            RS.on('ready', this.onReady);

            // Listen to Laverna events
            this.listenTo(Radio.channel('notes'), 'sync:model destroy:model restore:model', this.onSave);
            this.listenTo(Radio.channel('notebooks'), 'sync:model destroy:model restore:model', this.onSave);
            this.listenTo(Radio.channel('tags'), 'sync:model destroy:model restore:model', this.onSave);
        },

        isConnected: function() {
            return (RS.remote.connected && RS.remote.online);
        },

        /**
         * Got changes from RemoteStorage.
         */
        onRsChange: function(change) {

            // Don't do anything if changes are originated from local storage
            if (change.origin === 'local') {
                return;
            }

            var path    = change.relativePath.split('/'),
                channel = (change.newValue || change.oldValue).type || path[1];

            if (change.newValue) {
                change.newValue['@context'] = null;
            }

            Radio.request(channel, 'save:raw', change.newValue, {profile: path[0]});
        },

        /**
         * RemoteStorage is ready.
         */
        onReady: function() {
            var promises = [],
                self     = this,
                profile  = (Radio.request('uri', 'profile') || 'notes-db');

            RsModule.init(profile);

            // Synchronize all collections
            _.each(['notes', 'notebooks', 'tags'], function(module) {
                promises.push(function() {
                    return Q.all([
                        Radio.request(module, 'fetch', {encrypt: true, profile: profile}),
                        new Q(RsModule.getAll(module))
                    ])
                    .spread(function(localData, remoteData) {
                        return self.syncAll(localData, remoteData, module);
                    });
                });
            });

            return _.reduce(promises, Q.when, new Q())
            .then(function() {
                return RS.laverna.on('change', self.onRsChange);
            })
            .fail(function() {
                console.error('Error', arguments);
            });
        },

        /**
         * Synchronize local and remote data.
         */
        syncAll: function(localData, remoteData, module) {
            var promises = [],
                newData;

            localData    = localData.fullCollection || localData;

            // Find notes which don't exist in local storage or were updated
            // remotely.
            newData = _.filter(remoteData, function(rModel) {
                var lmodel = _.findWhere(localData.models, {id: rModel.id});
                return !lmodel || lmodel.attributes.updated < rModel.updated;
            });

            if (newData.length) {
                promises.push(
                    Radio.request(module, 'save:all:raw', newData, {profile: RsModule.profile})
                );
            }

            // Find notes which don't exist in RemoteStorage or have been
            // updated locally.
            _.each(localData.models, function(lModel) {
                var rmodel = _.findWhere(remoteData, {id: lModel.id});
                if (rmodel && rmodel.updated >= lModel.attributes.updated) {
                    return;
                }

                promises.push(
                    RsModule.save(module, lModel.attributes, lModel.encryptKeys)
                );
            });

            return Q.all(promises)
            .fail(function() {
                console.error('Error', arguments);
            });
        },

        /**
         * Local model was updated.
         */
        onSave: function(model) {
            return RsModule.save(model.storeName, model.attributes, model.encryptKeys);
        },

    });

    return Sync;
});
