/*global define*/
define([
    'underscore',
    'apps/encryption/auth',
], function (_, getAuth) {
    'use strict';

    var instance = null;

    function ModelEncrypt (configs, configsOld) {
        var names = ['encrypt', 'encryptPass', 'encryptSalt', 'encryptIter', 'encryptTag', 'encryptKeySize'];

        this.configs = _.pick(configs, names);
        this.configsOld = _.pick(configsOld, names);

        this.auth = getAuth(this.configs);
        this.auth.destroyKey();
        this.auth.session = false;
    }

    ModelEncrypt.prototype = {

        /**
         * Initializes an encryption progress
         */
        initialize: function (collections) {
            var self = this,
                done = $.Deferred(),
                method;

            // User disabled encryption - we need to decrypt all data
            if (Number(this.configsOld.encrypt) === 1 && Number(this.configs.encrypt) === 0) {
                method = 'decrypt';
            }
            // Encryption settings has been changed
            else if ( _.isEqual(this.configs, this.configsOld) === false ) {
                method = 'encrypt';
            }

            _.forEach(collections, function (collection, key) {
                var resp = self[method].apply(self, [collection]);

                $.when(resp).done(function () {
                    if (key === (collections.length - 1)) {
                        done.resolve();
                    }
                });
            });

            return done;
        },

        checkPassword: function (password, configName) {
            if (password === false) {
                return this[configName].secureKey;
            }
            else {
                this.auth.settings = this[configName];
                this[configName].secureKey = this.auth.getSecureKey(password);
                return this[configName].secureKey;
            }
        },

        encrypt: function (collection) {
            var done = $.Deferred(),
                data;

            if (collection.length === 0) {
                done.resolve();
            }

            collection.forEach(function (model, key) {
                this.auth.settings = this.configsOld;
                data = model.decrypt();

                this.auth.settings = this.configs;
                model.set(data).encrypt();

                model.save(model.toJSON(), {
                    success: function () {
                        if (key === (collection.length - 1)) {
                            done.resolve();
                        }
                        collection.trigger('encryption:progress');
                    }
                });
            }, this);

            return done;
        },

        decrypt: function (collection) {
            var done = $.Deferred();

            if (collection.length === 0) {
                done.resolve();
            }

            collection.forEach(function (model, key) {
                this.auth.settings = this.configsOld;

                model.save(model.decrypt(), {
                    success: function () {
                        if (key === (collection.length - 1)) {
                            done.resolve();
                        }
                        collection.trigger('encryption:progress');
                    }
                });
            }, this);

            return done;
        }

    };

    return function getSingleton (configs, configsOld) {
        return (instance = (instance || new ModelEncrypt(configs, configsOld)));
    };

});
