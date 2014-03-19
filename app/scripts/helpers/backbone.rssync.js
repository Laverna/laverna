/*global define*/
define([
    'underscore',
    'app',
    'remoteStorage'
], function (_, App, RemoteStorage) {
    'use strict';

    /**
     * Remote Storage Sync adapter for Backbone.js
     * Credits: https://github.com/litewrite/litewrite/blob/gh-pages/lib/backbone.remoteStorage-documents.js
     */
    var Rssync = function () { };
    Rssync = _.extend(Rssync.prototype, {

        auth: function () {
            _.bindAll(this, 'sync');

            RemoteStorage.access.claim({
                'notes'     : 'rw',
                'notebooks' : 'rw',
                'tags'      : 'rw'
            });
        },

        sync : function (method, model, options) {
            var resp;
            var done = $.Deferred();

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
            return model.collection.remote.get(model.id);
        },

        findAll: function (collection) {
            return collection.remote.getAll().then(function(objMap) {
                return _.values(objMap);
            });
        },

        set : function (model) {
            return model.collection.remote.set(model.id, model.toJSON()).then(function() {
                return model.toJSON();
            });
        },

        destroy: function (model) {
            return model.collection.remote.remove(model.id.toString()).then(function() {
                return model.toJSON();
            });
        }

    });

    Rssync.prototype.remote = function (model) {
        var moduleName = model.storeName || model.collection.storeName;

        RemoteStorage.defineModule(moduleName, function (privateClient, publicClient) {
            var remoteModule, listMethods;

            privateClient.cache(moduleName + '/', false);
            publicClient.cache(moduleName + '/', false);

            remoteModule = {
                privateList: function (path) {
                    return privateClient.scope(path + '/').extend(listMethods).cache('');
                },

                publicList: function (path) {
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

        return RemoteStorage[moduleName];

    };

    return Rssync;
});
