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

    _.extend(Rssync.prototype, {

        auth: function () {
            var d = $.Deferred(),
                self = this;

            _.bindAll(this, 'sync', 'triggerConnected');

            // Get access
            remoteStorage.access.claim('laverna', 'rw');

            // Display the widget
            remoteStorage.displayWidget();

            remoteStorage.on('ready', function () {
                self.triggerConnected();
                d.resolve(true);
            });

            remoteStorage.on('disconnected', function (e) {
                App.log('RemoteStorage has been disconnected');
                d.fail(e);
            });

            return d;
        },

        triggerConnected: function () {
            App.log('RemoteStorage has been connected');
            Backbone.cloud = this.sync;

            // Because RemoteStorage.js keeps changing history fragment to #
            if (App.getCurrentRoute() === '') {
                App.navigate('notes', true);
            }
        },

        sync : function (method, model, options) {
            var resp,
                done = $.Deferred();

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

        rssync: function (model) {
            return remoteAdapter().privateList(model);
        },

        find : function (model) {
            return this.rssync(model).get(model.id);
        },

        findAll: function (collection) {
            return this.rssync(collection).getAll().then(function(objMap) {
                return _.values(objMap);
            });
        },

        set : function (model) {
            return this.rssync(model).set(model.id, model.toJSON()).then(function() {
                return model.toJSON();
            });
        },

        destroy: function (model) {
            return this.rssync(model).remove(model.id.toString()).then(function() {
                return model.toJSON();
            });
        }

    });

    /**
     * Defines the module
     */
    remoteAdapter = function () {
        var moduleName = 'laverna',
            db,
            path;

        RemoteStorage.defineModule(moduleName, function (privateClient, publicClient) {
            var remoteModule, listMethods;

            remoteModule = {
                privateList: function (model) {
                    path = model.storeName || model.collection.storeName;
                    db = model.database.id || model.collection.database.id;

                    if (db !== 'notes-db') {
                        path = db + '/' + path;
                    }

                    return privateClient.scope(path + '/').extend(listMethods).cache('');
                },

                publicList: function () {
                    return publicClient.scope(path + '/').extend(listMethods).cache('');
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
                    return this.storeObject('text', id.toString(), doc).then(function() {
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
