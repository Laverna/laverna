/*global define*/
define([
    'underscore',
    'app',
    'backbone',
    'dropbox'
], function (_, App, Backbone, Dropbox) {
    'use strict';

    var Adapter = function () { };

    Adapter = _.extend(Adapter.prototype, {

        // OAuth authentification
        // ---------------------
        auth: function () {
            _.bindAll(this, 'sync');

            this.client = new Dropbox.Client({
                key    : 'io5vfg4w33jx9o4',
                // secret : 'u4rt9wf6id9xbi5',
                sandbox: true
            });

            this.client.authDriver(new Dropbox.AuthDriver.Popup({
                receiverUrl: 'http://localhost/ofnote/app/dropbox.html',
                rememberUser: true
            }));

            this.client.authenticate({interactive: false});
            if ( !this.client.isAuthenticated()) {
                this.client.authenticate();
            }

            // Override backbone sync method
            if (this.client.isAuthenticated()) {
                Backbone.cloud = this.sync;
            }
        },

        // Sync method
        // -----------
        sync: function (method, model, options) {
            var self = this,
                resp;

            if (this.client === void 0) {
                throw new Error('no dropbox client');
            }
            if (false === (this.client instanceof Dropbox.Client)) {
                throw new Error('invalid dropbox client');
            }

            options         = options           || {};
            options.success = options.success   || function() {};
            options.error   = options.error     || function() {};

            // Store every collection in different places
            this.createDir( this.getStore(model) )
                .fail(options.error)
                .done(function () {
                    resp = self.query(method, model, options);
                });

            return resp;
        },

        // Process request
        // ---------------
        query: function (method, model, options) {
            var resp;

            switch (method) {
                case 'read':
                    resp = model.id !== undefined ? this.find(model, options) : this.findAll(options);
                    break;
                case 'create':
                    resp = this.create(model);
                    break;
                case 'update':
                    resp = this.update(model);
                    break;
                case 'delete':
                    resp = this.destroy(model);
                    break;
            }

            if (resp) {
                resp.fail(options.error).done(options.success);
            }

            return resp;
        },

        // Create directory for files
        // --------------------------
        createDir: function (dir) {
            var d = $.Deferred(),
                self = this;

            this.client.metadata(dir, function (error, stat) {
                // Create only if not exists
                if (error) {
                    self.client.mkdir(dir, function (error, stat) {
                        if (error) {
                            d.reject(error);
                        }
                        else {
                            d.resolve(stat);
                        }
                        return true;
                    });
                }
                else {
                    d.resolve(stat);
                }
            });

            return d;
        },

        // Add a new model
        // ---------------
        create: function (model) {
            return this.writeFile(model);
        },

        // Update a model by replacing its copy in dropbox
        // -----------------------
        update: function (model) {
            return this.writeFile(model);
        },

        // Delete a model from Dropbox
        // ------------------------
        destroy: function (model) {
            if (model.id) {
                return;
            }
            var d = $.Deferred();
            this.client.remove(this.store + '/' + model.id, function (error, stat) {
                if (error) {
                    d.reject(error);
                } else {
                    d.resolve(stat);
                }
            });
            return d;
        },

        // Retrieve a model from dropbox
        // ----------------------------
        find: function (model) {
            var d = $.Deferred();

            this.client.readFile(
                this.store + '/' + model.get('id') + '.json',
                function (error, data) {
                    if (error) {
                        d.reject(error);
                    } else {
                        d.resolve(JSON.parse(data));
                    }
                    return true;
                }
            );

            return d;
        },

        // Collection of files - no content, just id and modified time
        // -------------------
        findAll: function () {
            var d = $.Deferred(),
                self = this,
                items = [],
                data,
                id;

            this.client.readdir(this.store, function (error, entries, fileStat) {
                if (error) {
                    d.reject(error);
                } else {
                    data = fileStat.json();
                    _.each(data.contents, function (item, iter) {
                        id = item.path.replace('/' + self.store + '/', '');
                        id = id.replace('.json', '');

                        items.push({
                            id : id,
                            updated: new Date(item.modified).getTime()
                        });

                        if (iter === data.contents.length-1) {
                            d.resolve(items);
                        }
                    });
                }
                return true;
            });

            return d;
        },

        // Write model's content to file
        // -----------------------------
        writeFile: function (model) {
            var d = $.Deferred();
            if ( !model.id) {
                return;
            }

            this.client.writeFile(
                this.store + '/' + model.id + '.json',
                JSON.stringify(model),
                function (error, stat) {
                    if (error) {
                        d.reject(error);
                    } else {
                        d.resolve(stat);
                    }
                    return true;
                }
            );

            return d;
        },

        // Directory name
        // --------------
        getStore: function (model) {
            this.store = model.storeName || model.collection.storeName;
            return this.store;
        }

    });

    return Adapter;
});
