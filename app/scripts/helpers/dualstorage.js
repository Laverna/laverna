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
    Backbone.Collection.prototype.pullCloud = function (pushCloud) {
        // @TODO check online status
        // -------------------------
        if (this.localCacheActive === true || !Backbone.cloud) {
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
                self.trigger('sync:before');
                self._syncToCloud(collection, collectionCloud);
            }
        });
    };

    /**
     * Save to default (local) storage
     */
    Backbone.Collection.prototype._syncFromCloud = function (collectionCloud) {
        var cloudModels = collectionCloud.models,
            self = this,
            model,
            newModel;

        var onSuccess = function () {
            console.log('Model ' + model.get('id') + ' already exists');
        };

        // Check existence in default storage
        _.each(cloudModels, function (m) {
            model = new this.model({ id : m.get('id') });
            model.fetch({
                success: onSuccess,
                error  : function () {
                    newModel = new self.model();
                    var data = _.extend(m.toJSON(), {'synchronized' : 1});

                    newModel.save(data, {
                        success: function () {
                            console.log('created model ' + newModel.get('id'));
                        }
                    });
                }
            });
        }, this);

        this.trigger('sync:after');
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
