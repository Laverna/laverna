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
    'jquery',
    'q',
    'backbone',
    'marionette',
    'backbone.radio',
    'dropbox',
    'modules/dropbox/classes/adapter'
], function(_, $, Q, Backbone, Marionette, Radio, Dropbox, adapter) {
    'use strict';

    /**
     * Dropbox synchronizer.
     *
     * Triggers:
     * 1. `auth:success` on `dropbox` channel
     *     - after authentication is completed successfully.
     * 2. `start` on `sync` channel
     *     when synchronizing starts
     * 3. `stop` on `sync` channel
     *     when synchronizing stops
     *
     * Replies:
     * 1. `start` on `sync` channel
     *     starts synchronizing.
     */
    var Sync = Marionette.Object.extend({

        configs  : {
            // Dropbox app key
            key         : '10iirspliqts95d',

            // Interval configs
            interval    : 2000,
            intervalMax : 15000,
            intervalMin : 2000,

            // A state which shows if something is changed remotely
            statRemote  : false
        },

        initialize: function() {
            var key = Radio.request('configs', 'get:config', 'dropboxKey');
            this.configs.key = key || this.configs.key;
            this.configs.accessToken = Radio.request('configs', 'get:config', 'dropboxAccessToken');

            this.vent = Radio.channel('dropbox');

            this.client = new Dropbox({
                clientId: this.configs.key
            });

            // Replies
            Radio.reply('sync', 'start', this.startSync, this);

            // Listen to Laverna events
            this.listenTo(Radio.channel('notes'), 'sync:model destroy:model restore:model', this.onSave);
            this.listenTo(Radio.channel('notebooks'), 'sync:model destroy:model restore:model', this.onSave);
            this.listenTo(Radio.channel('tags'), 'sync:model destroy:model restore:model', this.onSave);

            // Authorize the app
            var self = this;
            this.checkAuth()
            .then(function(authenticated) {
                if (authenticated) {
                    return self.onReady();
                }

                console.error('Dropbox authentication failed.');
            })
            .catch(function(err) {
                console.log('Dropbox error', err);
            });
        },

        /**
         * Start synchronizing immediately.
         */
        startSync: function() {
            if (this.timeout) {
                clearTimeout(this.timeout);
            }

            this.timeout = setTimeout(_.bind(function() {
                this.checkChanges();
            }, this), 0);
        },

        /**
         * Check if Dropbox was authenticated.
         */
        checkAuth: function() {
            var hash = this.parseHash();

            if (this.configs.accessToken && this.configs.accessToken.length) {
                this.client.setAccessToken(this.configs.accessToken);
                return Promise.resolve(true);
            }
            else if (hash.access_token && hash.access_token.length) {
                return this.saveAccessToken(hash.access_token);
            }
            else {
                if (hash.error) {
                    Radio.request('uri', 'navigate', '/');
                }

                return this.authenticate();
            }
        },

        /**
         * Parse location hash.
         *
         * @returns {Object}
         */
        parseHash: function() {
            var hash = window.location.hash.replace('#', '').split('&');
            var ret  = {};

            if (!hash.length) {
                return ret;
            }

            _.each(hash, function(str) {
                var parts = str.replace(/\+/g, ' ').split('=');

                if (parts.length > 1) {
                    var key  = parts.shift();
                    var val  = parts.length > 0 ? parts.join('=') : undefined;
                    val      = undefined ? null : decodeURIComponent(val.trim());
                    ret[key] = val;
                }
            });

            return ret;
        },

        authenticate: function() {
            var defer = Q.defer();
            var authUrl = this.client.getAuthenticationUrl(document.location);

            Radio.once('Confirm', 'cancel',  _.bind(defer.reject, defer));
            Radio.once('Confirm', 'confirm', function() {
                window.location = authUrl;
            });

            Radio.request('Confirm', 'start', {
                title  : $.t('dropbox.auth title'),
                content: $.t('dropbox.auth confirm')
            });

            return defer.promise;
        },

        /**
         * Save the access token in configs.
         *
         * @param {String} accessToken
         * @returns {Promise}
         */
        saveAccessToken: function(accessToken) {
            var self = this;
            return Radio.request('configs', 'save:object', {
                name  : 'dropboxAccessToken',
                value : accessToken,
            })
            .then(function() {
                Radio.request('uri', 'navigate', '/');
                self.configs.accessToken.accessToken;
                return true;
            });
        },

        /**
         * Start synchronizing all data after Dropbox client is ready.
         */
        onReady: function() {
            var profile = Radio.request('uri', 'profile') || 'notes-db';
            var self = this;
            adapter.init(this.client, profile);

            this.timeout = window.setTimeout(function() {
                self.checkChanges();
            }, 500);
        },

        /**
         * Check for changes.
         */
        checkChanges: function() {
            var promises = [],
                self     = this;

            this.configs.statRemote = false;
            Radio.trigger('sync', 'start', 'dropbox');

            // Synchronize all collections
            _.each(['notes', 'notebooks', 'tags'], function(module) {
                promises.push(function() {
                    return Q.all([
                        Radio.request(module, 'fetch', {encrypt: true}),
                        adapter.getAll(module)
                    ])
                    .spread(function(localData, remoteData) {
                        return self.syncAll(localData, remoteData, module);
                    });
                });
            });

            // After synchronizing, start watching for changes
            return _.reduce(promises, Q.when, new Q())
            .then(function() {
                Radio.trigger('sync', 'stop', 'dropbox');
                self.startWatch();
            })
            .fail(function(err) {
                if (err) {
                    switch (err.status) {

                        // If access was revoked, try to ask for it again
                        case 401:
                            self.checkAuth();
                            break;

                        // On connection error, increase watch interval
                        case 0:
                            self.configs.interval = self.configs.intervalMax;
                            self.startWatch();
                            break;
                    }
                }

                Radio.trigger('sync', 'stop', 'dropbox');
                Radio.trigger('sync', 'error', {cloud: 'dropbox', error: err});
                console.error('Error', arguments[0], arguments);
            });
        },

        /**
         * Synchronize a collection.
         *
         * @type array localData
         * @type array remoteData
         * @type string module
         * @return promise
         */
        syncAll: function(localData, remoteData, module) {
            var promises,
                encryptKeys = localData.model.prototype.encryptKeys;

            localData = (localData.fullCollection || localData).toJSON();

            promises = this.checkRemoteChanges(localData, remoteData, module);
            promises.push.apply(
                promises,
                this.checkLocalChanges(localData, remoteData, module, encryptKeys)
            );

            return _.reduce(promises, Q.when, new Q())
            .then(function() {
                return Radio.request(module, 'fetch', {encrypt: true});
            });
        },

        /**
         * Save only models which don't exist locally or which were updated
         * remotely.
         */
        checkRemoteChanges: function(localData, remoteData, module) {
            var promises = [],
                newData  = _.filter(remoteData, function(rModel) {
                    var model = _.findWhere(localData, {id: rModel.id});
                    return !model || model.updated < rModel.updated;
                });

            if (newData.length) {
                console.log('Dropbox changes:', newData);
                this.configs.statRemote = true;

                promises.push(function() {
                    return Radio.request(module, 'save:all:raw', newData, {profile: adapter.profile});
                });
            }

            return promises;
        },

        /**
         * Save only models which don't exist on Dropbox or
         * which were updated locally.
         */
        checkLocalChanges: function(localData, remoteData, module, encryptKeys) {
            var promises = [];

            _.each(localData, function(lModel) {
                var model = _.findWhere(remoteData, {id: lModel.id});
                if (model && model.updated >= lModel.updated) {
                    return;
                }

                console.log('Dropbox local changes:', lModel);
                promises.push(function() {
                    return adapter.save(module, lModel, encryptKeys);
                });
            });

            return promises;
        },

        startWatch: function() {
            if (this.timeout) {
                clearTimeout(this.timeout);
            }

            this.calcInterval();
            console.log('interval is', this.configs.interval);

            this.timeout = setTimeout(_.bind(function() {
                this.checkChanges();
            }, this), this.configs.interval);
        },

        /**
         * Increase or descrease watch interval depending on
         * whether changes appear on Dropbox.
         */
        calcInterval: function() {
            var range = this.configs.intervalMax - this.configs.intervalMin;

            if (this.configs.statRemote) {
                this.configs.interval -= (range * 0.4);
            }
            else {
                this.configs.interval += (range * 0.2);
            }

            this.configs.interval = Math.max(this.configs.intervalMin, this.configs.interval);
            this.configs.interval = Math.min(this.configs.intervalMax, this.configs.interval);
        },

        /**
         * Immediately after a model is changed locally, synchronize it with
         * Dropbox.
         */
        onSave: function(model) {
            return adapter.save(model.storeName, model.attributes, model.encryptKeys);
        }

    });

    return Sync;
});
