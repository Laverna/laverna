/*global define*/
define([
    'underscore',
    'jquery',
    'dropbox',
    'constants'
], function (_, $, Dropbox, CONST) {
    'use strict';

    /**
     * Dropbox sync Adapter for Backbone.js
     */
    var Adapter = function (model) {
        var key = CONST.DROPBOX_KEY;
        this.dir = (model ? model.storeName : 'notes');

        if (typeof model === 'object' && model.database.id !== 'notes-db') {
            this.dir = model.database.id + '/' + this.dir;
        }

        if (window.dropboxKey !== '') {
            key = window.dropboxKey;
        }

        this.client = new Dropbox.Client({
            key    : key
            // secret : constants.DROPBOX_SECRET
        });

        // Auth settings
        this.client.authDriver(new Dropbox.AuthDriver.Popup({
            receiverUrl: CONST.URL + 'dropbox.html',
            rememberUser: true
        }));

    };

    _.extend(Adapter.prototype, {

        auth: function (interactive) {
            var d = $.Deferred(),
                self = this;

            interactive = interactive || false;

            this.client.authenticate({ interactive: interactive }, function () {

                if ( self.client.isAuthenticated() ) {
                    d.resolve(true);
                }
                else if (interactive === false) {
                    $.when(self.auth(true)).then(function () {
                        d.resolve(true);
                    }, function () {
                        d.reject();
                    });
                }
                else {
                    d.reject();
                }

            });

            return d;
        },

        checkAuth: function () {
            this.client.authenticate({ interactive: false });
            return this.client.isAuthenticated();
        },

        sync: function (method, model, options) {
            var resp;

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

            return resp;
        },

        /**
         * Add a new model
         */
        create: function (model, options) {
            if ( !model.id) {
                model.set('id', this.guid());
            }
            return this.writeFile(model, options);
        },

        /**
         * Update a model by replacing its copy in dropbox
         */
        update: function (model, options) {
            return this.writeFile(model, options);
        },

        /**
         * Delete a model from Dropbox
         */
        destroy: function (model) {
            if ( !model.id) {
                return;
            }
            var d = $.Deferred();
            this.client.remove(this.dir + '/' + model.id + '.json', function (error, stat) {
                if (error) {
                    d.reject(error);
                } else {
                    d.resolve(stat);
                }
            });
            return d;
        },

        /**
         * Retrieve a model from dropbox
         */
        find: function (model) {
            var d = $.Deferred();

            this.client.readFile(
                this.dir + '/' + model.get('id') + '.json',
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

        /**
         * Collection of files - no content, just id and modified time
         */
        findAll: function () {
            var d = $.Deferred(),
                self = this,
                items = [],
                data,
                id;

            this.client.readdir(this.dir, function (error, entries, fileStat) {
                if (error) {
                    // It's OK
                    if (error.status === 404) {
                        d.resolve();
                    }
                    else {
                        d.reject(error);
                    }
                }
                else {
                    if (entries.length === 0) {
                        d.resolve(entries);
                    }

                    data = fileStat.json();

                    _.each(data.contents, function (item, iter) {

                        /* jshint camelcase: false */
                        if ( !item.is_dir ) {
                            id = item.path.replace('/' + self.dir + '/', '');
                            id = id.replace('.json', '');

                            items.push({
                                id : id,
                                updated: new Date(item.modified).getTime()
                            });
                        }
                        if (iter === data.contents.length-1) {
                            d.resolve(items);
                        }

                    });
                }
                return true;
            });

            return d;
        },

        /**
         * Write model's content to file
         */
        writeFile: function (model) {
            var d = $.Deferred();
            if ( !model.id) {
                return;
            }

            this.client.writeFile(
                this.dir + '/' + model.id + '.json',
                JSON.stringify(model),
                function (error) {
                    if (error) {
                        d.reject(error);
                    } else {
                        d.resolve(model);
                    }
                    return true;
                }
            );

            return d;
        },

        S4: function () {
            /*jslint bitwise: true */
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        },

        /**
         * Generate a pseudo-GUID by concatenating random hexadecimal.
         */
        guid: function () {
            return (this.S4()+this.S4()+'-'+this.S4()+'-'+this.S4()+'-'+this.S4()+'-'+this.S4()+this.S4()+this.S4());
        }

    });

    return function (method, model, options) {
        var adapter = new Adapter(model),
            done = $.Deferred(),
            args = arguments,
            resp;

        if (method === 'auth') {
            // No popup === true
            if (arguments[1] === true) {
                return adapter.checkAuth();
            }
            else {
                return adapter.auth();
            }
        }
        else {
            $.when(adapter.auth()).then(function () {
                resp = adapter.sync.apply(adapter, args);
            });
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

    };

});
