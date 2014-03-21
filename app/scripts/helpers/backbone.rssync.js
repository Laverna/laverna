/*global define*/
/*global RemoteStorage*/
define([
    'underscore',
    'app',
    'backbone',
    'remotestorage'
], function (_, App, Backbone, remoteStorage) {
    'use strict';

    /**
     * Remote Storage Sync adapter for Backbone.js
     * Credits: https://github.com/litewrite/litewrite/blob/gh-pages/lib/backbone.remoteStorage-documents.js
     */
    var Rssync = function () { },
        remoteAdapter;

    Rssync = _.extend(Rssync.prototype, {

        auth: function () {
            _.bindAll(this, 'sync', 'triggerConnected', 'triggerDisconnected');

            // Because RemoteStorage.js keeps changing history fragment to #/
            App.navigateBack();

            // Get access
            remoteStorage.access.claim('notes', 'rw');
            remoteStorage.access.claim('notebooks', 'rw');
            remoteStorage.access.claim('tags', 'rw');

            // Display the widget
            remoteStorage.displayWidget();

            remoteStorage.on('ready', this.triggerConnected);
            remoteStorage.on('disconnected', this.triggerDisconnected);
        },

        triggerConnected: function () {
            App.log('RemoteStorage has been connected');
            Backbone.cloud = this.sync;
        },

        triggerDisconnected: function () {
            App.log('RemoteStorage has been disconnected');
        },

        sync : function (method, model, options) {
            var resp;
            var done = $.Deferred();

            this.rssync = remoteAdapter(model).privateList();

            switch (method) {
                case 'read':
                    resp = model.id !== undefined ? this.find(model) : this.findAll(model);
                    break;
                case 'create':
                    resp = this.set(model);
                    break;
                case 'update':
                    resp = this.set(model);
                    break;
                case 'delete':
                    resp = this.destroy(model);
                    break;
            }

            resp.then(function(res) {
                options.success(res);
                if (options.complete) {
                    options.complete(res);
                }
                done.resolve(res);
            }, function(res) {
                options.error(res);
                if (options.complete) {
                    options.complete(res);
                }
                done.reject(res);
            });

            return done;
        },

        find : function (model) {
            return this.rssync.get(model.id);
        },

        findAll: function (/*collection*/) {
            return this.rssync.getAll().then(function(objMap) {
                return _.values(objMap);
            });
        },

        set : function (model) {
            return this.rssync.set(model.id, model.toJSON()).then(function() {
                return model.toJSON();
            });
        },

        destroy: function (model) {
            return this.rssync.remove(model.id.toString()).then(function() {
                return model.toJSON();
            });
        }

    });

    /**
     * Defines the module
     */
    remoteAdapter = function (model) {
        var moduleName = model.storeName || model.collection.storeName;

        RemoteStorage.defineModule(moduleName, function (privateClient, publicClient) {
            var remoteModule, listMethods;

            remoteModule = {
                privateList: function () {
                    return privateClient.scope().extend(listMethods).cache('', false);
                },

                publicList: function (path) {
                    return publicClient.scope(path + '/').extend(listMethods).cache('', false);
                }
            };

            listMethods = {
                // Create a new object
                // --------------------
                add: function(doc) {
                    var id = privateClient.uuid();
                    return this.set(id, doc);
                },

                // Update or create a document for a specified id.
                // --------------------
                set: function(id, doc) {
                    return this.storeObject('text', id, doc).then(function() {
                        doc.id = id;
                        return    doc;
                    });
                },

                // Get a document.
                // ---------------
                get: function(id) {
                    return this.getObject(id.toString()).then(function(obj) {
                        return obj || {};
                    });
                },

                // Store a raw document of the specified contentType at shared/.
                // ------------------------------
                addRaw: function(contentType, data) {
                    var id = privateClient.uuid(),
                        path = 'shared/' + id,
                        url = this.getItemURL(path);

                    return this.storeFile(contentType, path, data).then(function() {
                        return     url;
                    });
                },

                // Store a raw doccument of the specified contentType at shared/.
                // ---------------------
                setRaw: function(id, contentType, data) {
                    var path = 'shared/' + id;
                    return this.storeFile(contentType, path, data);
                }

            };

            return { exports : remoteModule };

        });

        return remoteStorage[moduleName];

    };

    return Rssync;
});
