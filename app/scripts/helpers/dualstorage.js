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

    /**
     * Fetch collection from the cloud storage
     */
    Backbone.Collection.prototype.pullCloud = function (pushCloud, forceSync) {
        // @TODO check online status
        // -------------------------
        if (this.localCacheActive && forceSync === true || !Backbone.cloud) {
            return;
        }

        var collectionCloud = new this.constructor(),
            self = this;

        collectionCloud.sync = Backbone.cloud;
        this.localCacheActive = true;

        // Fetch results from cloud storage
        collectionCloud.fetch({
            reset  : false,
            success: function () {
                self.trigger('sync:before');
                self._syncFromCloud(collectionCloud);
            }
        });

        if (pushCloud === true) {
            this.on('sync:toCloud', this.pushCloud, this);
        } else {
            this.trigger('sync:after');
        }
    };

    /**
     * Push local changes into cloud storage
     */
    Backbone.Collection.prototype.pushCloud = function (collectionCloud) {
        var collection = this.clone(),
            self = this;

        collection.fetch({
            conditions : {synchronized : 0},
            success    : function () {
                console.log(collection.length + ' objects to sync');
                self._syncToCloud(collection, collectionCloud);
            },
            error: function () {
                self.trigger('sync:after');
            }
        });
    };

    /**
     * Save to default (local) storage
     */
    Backbone.Collection.prototype._syncFromCloud = function (collectionCloud) {
        var cloudModels = collectionCloud.models,
            data,
            model;

        // Check existence in default storage
        _.each(cloudModels, function (m) {
            model = new this.model({ id : m.get('id') });
            model.fetch({
                success: function (model) {
                    var needUpdate = model.get('updated') !== m.get('updated');
                    if (model.get('synchronized') === 1 && needUpdate) {
                        data = _.extend(m.toJSON(), {'synchronized' : 1});
                        model.save(data, {
                            success: function () {
                                console.log('Model ' + model.get('id') + ' updated');
                            }
                        });
                    }
                },
                // Object isn't exist -- create new
                error  : function () {
                    data = _.extend(m.toJSON(), {'synchronized' : 1});
                    model.save(data, {
                        success: function () {
                            console.log('created model ' + model.get('id'));
                        }
                    });
                }
            });
        }, this);

        this.trigger('sync:toCloud', collectionCloud);
    };

    /**
     * Save local changes to cloud storage
     */
    Backbone.Collection.prototype._syncToCloud = function (local, cloud) {
        var models = local.models,
            method = 'create',
            onSuccess,
            onError,
            model;

        onSuccess = function () {
            console.log('Sync model ' + model.get('id'));
            model.save({ synchronized: 1 });
        };
        onError = function () {
            console.log('error');
        };

        for (var i = 0; i < models.length; i++) {
            model = models[i];
            if (cloud.get(model.get('id')) ) {
                method = 'update';
            }
            Backbone.cloud(method, model, {
                success : onSuccess,
                error   : onError
            });
        }

        this.trigger('sync:after');
    };

});
