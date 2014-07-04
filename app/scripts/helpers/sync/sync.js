/*global define*/
define([
    'underscore',
    'jquery',
    'collections/removed',
    'helpers/sync/dropbox',
    'helpers/sync/remotestorage'
], function (_, $, Removed, DropboxSync, RemoteSync) {
    'use strict';

    /**
     * It'll synchronize collection's data from a cloud storage to a local
     * and opposite
     */
    function Sync (cloud, collection) {

        switch (cloud.toLowerCase()) {
            case 'dropbox':
                this.cloud = DropboxSync;
                break;
            case 'remotestorage':
                this.cloud = RemoteSync;
                break;
        }

        // Collection contains IDs of removed objects
        this.removed = new Removed();

        // Create new instances of collection
        this.collection = new collection.constructor();
        this.collectionCloud = new collection.constructor();
        this.collectionCloud.sync = this.cloud;

    }

    Sync.prototype = {

        start: function () {
            var done = $.Deferred(),
                self = this,
                resp;

            // User is offline or no cloud storage
            if ( !window.navigator.onLine || !this.cloud ) {
                done.reject();
                return;
            }

            // Fetch all from cloud storage and local, then check it
            $.when(this.collection.fetch(), this.collectionCloud.fetch(), this.removed.fetch())
            .then(function () {
                resp = self.checkUpdates(done);
            });

            return done;

        },

        checkUpdates: function (done) {
            var self = this,
                res;

            function resolve () {
                res.then(
                    function (result) {
                        done.resolve(result);
                    },
                    function (error) {
                        done.reject(error);
                    }
                );
            }

            if (this.collectionCloud.length === 0) {
                res = this.checkLocal();
                resolve();
            }
            else {
                $.when(this.checkCloud()).then(function () {
                    res = self.checkLocal();
                    resolve();
                });
            }

            return res;
        },

        /**
         * Check for updates objects from cloud storage
         */
        checkCloud: function () {
            var d = $.Deferred(),
                resp;

            this.collectionCloud.each(function (model, iter) {

                // Check updated time
                resp = this.localNeedsUpdate(model);

                // If it's a last model in the collection
                if (iter === (this.collectionCloud.length - 1)) {
                    resp.then(function () {
                        d.resolve();
                    });
                }

            }, this);

            return d;
        },

        /**
         * Check for updates objects from local storage
         */
        checkLocal: function () {
            var d = $.Deferred(),
                resp,
                collection;

            // Filter local collection so it synchronizes only changed objects
            if (this.collectionCloud.length !== 0) {
                collection = this.collection.where({'synchronized': 0});
                this.collection.reset(collection);
            }

            // Local collection is empty
            if (this.collection.length === 0) {
                d.resolve();
                return d;
            }

            this.collection.each(function (model, iter) {

                resp = this.updateCloud(model);
                if (iter === (this.collection.length - 1)) {
                    resp.then(function () {
                        d.resolve();
                    }, function (e) {
                        d.reject(e);
                    });
                }

            }, this);

            return d;

        },

        /**
         * Check data from cloud storage and if there are any changes,
         * update local version
         */
        localNeedsUpdate: function (model) {
            var d = $.Deferred(),
                self = this,
                local = this.collection.get(model.id);

            if (local && Number(local.get('synchronized')) === 0) {
                d.resolve();
            }
            // User removed it locally
            else if (this.removed.getID(model)) {
                this.destroyFromCloud(model, d);
            }
            else {
                // If it's a "fake" model, fetch
                if (this.cloud === DropboxSync) {
                    $.when( this.cloud('read', model) ).then(function (m) {
                        model.set(m);
                        self.updateLocal(model, local, d);
                    });
                }
                else {
                    this.updateLocal(model, local, d);
                }
            }

            return d;
        },

        /**
         * Update local version of a model
         */
        updateLocal: function (model, local, done) {
            var isNew = false;

            // There is no such model in local storage
            if ( !local ) {
                isNew = true;
                local = new this.collection.model({ id : model.id });
            }

            // Local version of a model is newer
            if ( !isNew && local.get('updated') >= model.get('updated') ) {
                done.resolve();
            }
            // Create or save to local storage
            else {
                local.save(_.extend(model.toJSON(), {'synchronized': 1}), {
                    success: function () {
                        done.resolve();
                    },
                    error: function (e) {
                        done.reject(e);
                    }
                });
            }

            return done;
        },

        /**
         * Update or create object in the cloud storage
         */
        updateCloud: function (model) {
            var d = $.Deferred(),
                method = 'create';

            // There is no such model in the cloud storage
            if (this.collectionCloud.get(model.id)) {
                method = 'update';
            }

            this.cloud(method, model, {
                success: function () {
                    // Update sync status of a model from indexeddb
                    $.when(model.save({ 'synchronized' : 1 }))
                    .then(function () {
                        d.resolve();
                    });
                },
                error: function (e) {
                    d.reject(e);
                }
            });

            return d;
        },

        /**
         * Destroy a model from the cloud storage
         */
        destroyFromCloud: function (model, d) {
            var self = this;

            if ( !model.id ) {
                self.cleanRemoved(model, d);
            }
            else {
                $.when(this.cloud('delete', model)).then(function () {
                    self.cleanRemoved(model, d);
                });
            }
        },

        cleanRemoved: function (model, d) {
            var removed = this.removed.getID(model);
            removed.destroy({
                success: function () {
                    d.resolve(d);
                }
            });
        }

    };

    return Sync;

});
