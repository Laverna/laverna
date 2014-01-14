/*global define*/
define([
    'underscore',
    'app',
    'backbone',
    'helpers/dropbox',
    'indexedDB'
], function (_, App, Backbone, Dropbox) {
    'use strict';

    // Dropbox OAuth
    if (App.settings.cloudStorage === 'dropbox') {
        Dropbox.auth();
    }

    var Cloud = function () {
    };

    _.extend(Cloud.prototype, {

        initialize: function (collection) {
            _.bindAll(this, 'pull', 'saveToLocal');

            this.collectionCloud = new collection.constructor();
            this.collectionCloud.sync = Backbone.cloud;
            this.collection = collection.clone();

            // When synchronizing with server is done
            this.collection.on('sync:cloudPull', this.push, this);

            // Synchronize status
            this.collection.on('sync:before', function () {
                App.trigger('sync:before');
                collection.trigger('sync:before');
            });
            this.collection.on('sync:after', function () {
                App.trigger('sync:after');
                collection.trigger('sync:after');
            });

            // Fetch any data from indexeddb
            $.when(this.collection.fetch({ limit : 1 } )).done(this.pull);
        },

        // From cloud to indexedDB
        // -----------------------
        pull: function () {
            var time = this.getSyncTime(),
                self = this,
                isLast;

            self.collection.trigger('sync:before');
            this.collectionCloud.fetch({
                reset : true,
                success: function () {
                    if (self.collectionCloud.length === 0) {
                        self.collection.trigger('sync:cloudPull');
                    }
                    self.collectionCloud.each(function (model, iter) {
                        isLast = iter === self.collectionCloud.length-1;
                        if (time === null || time < model.get('updated')) {
                            Backbone.cloud('read', model, {
                                success: function (modelCloud) {
                                    model.set(modelCloud);
                                    self.saveToLocal(model, isLast);
                                },
                                error: function () {
                                    throw new Error('Dropbox pull error');
                                }
                            });
                        } else if(isLast) {
                            // If last model from cloud - save synchronized time
                            self.saveSyncTime();
                            self.collection.trigger('sync:cloudPull');
                        }
                    });
                },
                error: function () {
                    App.log('Error happened with cloud storage API');
                    self.collection.trigger('sync:after');
                }
            });
        },

        // Save local changes to the cloud storage
        // ---------------------------------------
        push: function () {
            var conditions = {synchronized : 0},
                self = this;

            // If cloud storage is empty, synchronize all data
            if (this.collectionCloud.length === 0 && this.collection.length > 0) {
                App.log('Cloud storage is empty');
                conditions = null;
            }

            this.collection.fetch({
                reset: true,
                conditions : conditions,
                success    : function () {
                    App.log(self.collection.length + ' objects to sync');
                    self.saveToCloud();
                },
                error: function () {
                    App.log('error');
                    self.collection.trigger('sync:after');
                }
            });
        },

        // Save changes from the cloud to local Database
        // --------------------------------------------
        saveToLocal: function (modelCloud, isLast) {
            var self = this,
                needUpdate,
                model;

            // Check existence in local database
            model = new this.collection.model({ id : modelCloud.get('id') });
            model.fetch({
                // Model exists, but needs to be upgraded
                success: function () {
                    needUpdate = model.get('updated') !== modelCloud.get('updated');
                    if (model.get('synchronized') === 1 && needUpdate) {
                        self.saveLocalModel(model, modelCloud, isLast);
                    }
                },
                // Probably not exist
                error: function () {
                    self.saveLocalModel(model, modelCloud, isLast);
                }
            });
        },

        // Update model in local Database
        // ------------------------------
        saveLocalModel: function (model, modelCloud, isLast) {
            var data = _.extend(modelCloud.toJSON(), {'synchronized' : 1}),
                self = this;

            model.save(data, {
                success: function () {
                    App.log('Synchronized model ' + model.get('id'));
                    if (isLast === true) {
                        // If last model from the cloud - save synchronized time
                        self.saveSyncTime();
                        self.collection.trigger('sync:cloudPull');
                    }
                },
                error: function () {
                    App.log('Can\'t synchronize model ' + model.get('id'));
                    throw new Error('Dropbox pull error');
                }
            });
        },

        // Save local changes to the cloud storage
        // --------------------------------------------
        saveToCloud: function () {
            var models = this.collection.models,
                method = 'create';

            if (this.collection.length === 0) {
                this.collection.trigger('sync:after');
            }

            this.collection.each(function (model, i) {
                model = models[i];
                if (this.collectionCloud.get(model.get('id')) ) {
                    method = 'update';
                }
                Backbone.cloud(method, model, {
                    success : function () {
                        App.log('Uploaded to the cloud model ' + model.get('id'));
                        model.save({ synchronized: 1 });
                    },
                    error   : function () {
                        App.log('error');
                    }
                });
                if (models.length-1 === i) {
                    this.collection.trigger('sync:after');
                }
            }, this);
        },

        // Last synchronized time
        // ----------------------
        getSyncTime: function () {
            var time = null;
            // If indexedDB is empty, we should pull all data from the cloud
            if (this.collection.length !== 0) {
                time = localStorage.getItem('dropbox:syncTime:' + this.collection.storeName);
            }
            return time;
        },

        // Save synchronized time
        // ----------------------
        saveSyncTime: function () {
            return localStorage.setItem(
                'dropbox:syncTime:' + this.collection.storeName,
                new Date().getTime()
            );
        }

    });

    /**
     * Fetch collection from the cloud storage
     */
    Backbone.Collection.prototype.syncWithCloud = function (forceSync) {
        // No cloud storage or user is offline
        if (navigator.onLine === false || !Backbone.cloud) {
            App.log('You are offline');
            return;
        }

        // If this controller already synchronized
        if (App.cachedWithCloud === this.storeName && forceSync !== true) {
            App.log('Already synchronized');
            return;
        }

        var that = this;
        App.cachedWithCloud = this.storeName;

        // Test connection even if navigator.onLine == true
        $.ajax({
            url      : '//www.google.com/jsapi',
            timeout  : 1000,
            dataType : 'script'
        }).done(function () {
            App.log('sync started');
            return new Cloud().initialize(that);
        });
    };

});
