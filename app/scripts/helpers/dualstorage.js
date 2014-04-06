/*global define*/
define([
    'underscore',
    'app',
    'backbone',
    'indexedDB'
], function (_, App, Backbone) {
    'use strict';

    var Sync = App.module('App.Sync', {startWithParent: false}),
        done = $.Deferred(),
        adapter = 'helpers/';

    switch (App.settings.cloudStorage) {
    case 'dropbox':
        adapter += App.settings.cloudStorage;
        break;
    case 'remotestorage':
        adapter += 'backbone.rssync';
        break;
    }

    // CloudStorage: auth
    if (adapter !== 'helpers/') {
        require([adapter], function (CloudStorage) {
            $.when(new CloudStorage().auth()).done(function () {
                done.resolve(true);
            });
        });
    }

    /**
     * When sync module starts - sync all collections
     */
    Sync.on('start', function () {
        var collections = ['notes', 'notebooks', 'tags'],
            collection;

        App.log('Synchronize all collections');

        // Synchronize all collections
        _.each(collections, function (col) {
            require(['collections/' + col], function (Col) {
                collection = new Col();
                collection.syncWithCloud();
            });
        });
    });

    Sync.Model = function () { };
    _.extend(Sync.Model.prototype, {

        init: function (collection) {
            _.bindAll(this, 'start', 'syncFromCloud', 'toLocal');

            // No cloud storage or user is offline
            if (navigator.onLine === false || !Backbone.cloud) {
                App.log('You are offline');
                return false;
            }

            $.when(adapter).done(this.start(collection));
        },

        start: function (collection) {
            // Synchronized objects
            this.synced = [];

            this.collectionCloud = new collection.constructor();
            this.collectionCloud.sync = Backbone.cloud;
            this.collection = collection.clone();

            // Sync events
            this.collectionCloud.on('sync:after', this.syncToCloud, this);
            this.collection.on('sync:local', this.syncDirty, this);

            // Trigger event - before
            App.trigger('sync:before');
            collection.trigger('sync:before');

            // Trigger event - after
            this.collection.on('sync:after', function () {
                this.saveSyncTime();
                App.trigger('sync:after');
                collection.trigger('sync:after', this.synced);
            }, this);

            // Fetch data from local database and cloud
            $.when(this.collection.fetch(), this.collectionCloud.fetch())
                .done(this.syncFromCloud);
        },

        /**
         * Synchronize cloud data
         */
        syncFromCloud: function () {
            var self = this,
                dirty = this.collection.getDirty(),
                time = this.getSyncTime(),
                notRemoved,
                isLast;

            // No data in the cloud storage
            if (this.collectionCloud.length === 0) {
                this.collectionCloud.trigger('sync:after');
                return;
            }

            this.collectionCloud.each(function (model, iter) {
                isLast = (iter === self.collectionCloud.length-1);
                notRemoved = (_.indexOf(dirty, model.get('id')) === -1);

                if (model.get('title') && notRemoved === true) {
                    self.toLocal(model, isLast);
                }
                // This is not object just ID - fetch model
                else if (time === null || (time < model.get('updated') && notRemoved)) {
                    Backbone.cloud('read', model, {
                        success: function (modelCloud) {
                            model.set(modelCloud);
                            self.toLocal(model, isLast);
                        },

                        error  : function () {
                            throw new Error('Error occured while trying to fetch data from the cloud');
                        }
                    });
                }
                else if (isLast === true) {
                    self.collectionCloud.trigger('sync:after');
                }
            });
        },

        /**
         * Save to local storage (indexedDB)
         */
        toLocal: function (model, isLast) {
            var self = this,
                local = this.collection.get(model.get('id')),
                needUpdate;

            function saveToLocal () {
                self.synced.push(model.get('id'));

                local.save(_.extend(model.toJSON(), {'synchronized': 1 }), {
                    success: function () {
                        if (isLast === true) {
                            self.collectionCloud.trigger('sync:after');
                        }
                    },
                    error : function () {
                        throw new Error('Error occured while trying to save to indexeddb');
                    }
                });
            }

            // Model does not exist - create
            if ( !local) {
                local = new this.collection.model({ id : model.get('id') });
                saveToLocal();
            }
            // Model exists - check to updates
            else {
                needUpdate = local.get('updated') !== model.get('updated');

                // User does not changed data localy
                if (local.get('synchronized') === 1 && needUpdate) {
                    saveToLocal();
                }
                else if (isLast === true) {
                    this.collectionCloud.trigger('sync:after');
                }
            }
        },

        /**
         * Synchonize local changes to the cloud
         */
        syncToCloud: function () {
            var self = this,
                method = 'create',
                collection,
                isLast;

            // Synchronize only new or changed data
            if (this.collectionCloud.length !== 0) {
                collection = this.collection.where({'synchronized': 0});
                this.collection.reset(collection);
            }

            if (this.collection.length === 0) {
                this.collection.trigger('sync:local');
                return;
            }

            this.collection.each(function (model, iter) {
                isLast = (iter === self.collection.length);
                if (self.collectionCloud.get(model.get('id'))) {
                    method = 'update';
                }

                Backbone.cloud(method, model, {
                    success: function () {
                        App.log('Model #' + model.get('id') + ' synchronized');
                        model.save({ 'synchronized' : 1 });

                        if (isLast === true) {
                            self.collection.trigger('sync:local');
                        }
                    },

                    error  : function () {
                        throw new Error('Synchronizing error');
                    }
                });
            });
        },

        /**
         * Remove from the cloud models that has been removed from indexedDB
         */
        syncDirty: function () {
            var self = this,
                dirty = this.collection.getDirty(),
                model;

            if (dirty.length === 0) {
                this.collection.trigger('sync:after');
                return;
            }

            _.each(dirty, function (id, iter) {
                model = new this.collectionCloud.model({ id: id });

                Backbone.cloud('delete', model, {
                    success: function () {
                        App.log('Model #' + id + ' has been removed');

                        if (iter === dirty.length-1) {
                            self.collection.trigger('sync:after');
                            self.collection.resetDirty();
                        }
                    },

                    error : function () {
                        throw new Error('Error occured while trying to remove data from the cloud');
                    }
                });

            }, this);
        },

        /**
         * Last synchronized timestamp
         */
        getSyncTime: function () {
            var time = null;
            // If indexedDB is empty, we should pull all data from the cloud
            if (this.collection.length !== 0) {
                time = localStorage.getItem(App.settings.cloudStorage + ':syncTime:' + this.collection.storeName);
            }
            return time;
        },

        /**
         * Save synchronized time
         */
        saveSyncTime: function () {
            return localStorage.setItem(
                App.settings.cloudStorage + ':syncTime:' + this.collection.storeName,
                new Date().getTime()
            );
        }

    });

    /**
     * Sync wrapper for Backbone collections
     */
    Backbone.Collection.prototype.syncWithCloud = function () {
        new Sync.Model().init(this);
    };

    /**
     * Return models id that needs to be removed from the cloud storage
     */
    Backbone.Collection.prototype.getDirty = function () {
        var dirty = localStorage.getItem(this.storeName + '_dirty');
        return (_.isString(dirty) && dirty !== '') ? dirty.split(',') : [];
    };

    Backbone.Collection.prototype.syncDirty = function (model) {
        var dirty = this.getDirty();
        dirty.push(model.get('id'));
        localStorage.setItem(this.storeName + '_dirty', dirty.join());
    };

    Backbone.Collection.prototype.resetDirty = function () {
        localStorage.setItem(this.storeName + '_dirty', '');
    };

    return Sync;

});
