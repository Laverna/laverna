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
            RS.laverna.on('change', this.onRsChange);

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
            var model   = change.newValue || change.oldValue,
                profile = change.relativePath.split('/')[0];

            if (change.newValue) {
                change.newValue['@context'] = null;
            }
            Radio.request(model.type, 'save:raw', change.newValue, {profile: profile});
        },

        /**
         * RemoteStorage is ready.
         */
        onReady: function() {
            var promises = [],
                self     = this;

            RsModule.init(Radio.request('uri', 'profile') || 'notes-db');

            // Synchronize all collections
            _.each(['notes', 'notebooks', 'tags'], function(module) {
                promises.push(function() {
                    return Q.all([
                        Radio.request(module, 'fetch', {encrypt: true}),
                        RsModule.getAll(module)
                    ])
                    .spread(function(localData, remoteData) {
                        return self.syncAll(localData, remoteData, module);
                    });
                });
            });

            return _.reduce(promises, Q.when, new Q())
            .fail(function() {
                console.error('Error', arguments);
            });
        },

        /**
         * Synchronize local and remote data.
         */
        syncAll: function(localData, remoteData, module) {
            var promises = [];

            // Find notes which don't exist in local storage
            remoteData = _.filter(remoteData, function(rModel) {
                return !_.findWhere(localData.models, {id: rModel.id});
            });

            if (remoteData.length) {
                promises.push(
                    Radio.request(module, 'save:all:raw', remoteData, {profile: RsModule.profile})
                );
            }

            // Find notes which don't exist in RemoteStorage and create them
            _.each(localData.models, function(lModel) {
                if (lModel && !_.findWhere(remoteData, {id: lModel.id})) {
                    promises.push(
                        RsModule.save(module, lModel.attributes)
                    );
                }
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
            return RsModule.save(model.storeName, model.attributes);
        },

    });

    return Sync;
});
