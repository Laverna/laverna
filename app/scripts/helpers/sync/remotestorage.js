/*global define*/
define([
    'underscore',
    'jquery',
    'remotestorage',
    'helpers/sync/remotestorage-module'
], function (_, $, remoteStorage, module) {
    'use strict';

    /**
     * RemoteStorage Adapter for Backbone.js
     */
    var Adapter = function (model) {
        var type = (model ? model.storeName : 'notes'),
            path;

        if (model && model.database.id !== 'notes-db') {
            path = model.database.id;
        }

        this.store = module.personal(type, path);
    };

    _.extend(Adapter.prototype, {

        /**
         * Claiming access
         */
        auth: function () {
            var d = $.Deferred();

            // Get access
            remoteStorage.access.claim('laverna', 'rw');

            remoteStorage.on('ready', function () {
                d.resolve(true);
            });

            return d;
        },

        sync: function (method, model, options) {
            var done = $.Deferred(),
                resp;

            switch (method) {
            case 'read':
                resp = model.id !== undefined ? this.find(model, options) : this.findAll(options);
                break;
            case 'create':
                resp = this.create(model, options);
                break;
            case 'update':
                resp = this.update(model, options);
                break;
            case 'delete':
                resp = this.destroy(model, options);
                break;
            }

            function callMethod (method, res) {
                if (options && _.has(options, method)) {
                    options[method](res);
                }
            }

            resp.then(function(res) {
                callMethod('success', res);
                callMethod('complete', res);
                done.resolve(res);
            }, function(res) {
                callMethod('error', res);
                callMethod('complete', res);
                done.reject(res);
            });

            return done;
        },

        find: function (model) {
            return this.store.get(model.id);
        },

        findAll: function (collection) {
            return this.store.findAll(collection);
        },

        create: function (model) {
            return this.store.create(model);
        },

        update: function (model) {
            return this.store.save(model.id, model);
        },

        destroy: function (model) {
            return this.store.destroy(model);
        }

    });

    return function () {
        var adapter = new Adapter(arguments[1]);

        if (arguments[0] === 'auth') {
            return adapter.auth();
        }
        else {
            return adapter.sync.apply(adapter, arguments);
        }
    };

});
