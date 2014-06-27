/*global define*/
define([
    'underscore',
    'marionette',
    'apps/encryption/auth',
    'app'
], function (_, Marionette, getAuth, App) {
    'use strict';

    function ModelEncrypt (configs, configsOld) {
        var names = ['encrypt', 'encryptPass', 'encryptSalt', 'encryptIter', 'encryptTag', 'encryptKeySize'];

        this.configs = _.pick(configs, names);
        this.configsOld = _.pick(configsOld, names);
        this.auth = getAuth(this.configs);
    }

    /**
     * Encryption settings: {
     *  encrypt: 1 || 0, // enabled or disabled
     * }
     */
    ModelEncrypt.prototype = {

        initialize: function (collections) {
            var self = this,
                done = $.Deferred(),
                method;

            // User disabled encryption - we need to decrypt all data
            if (Number(this.configsOld.encrypt) === 1 && Number(this.configs.encrypt) === 0) {
                // .. decryption
                console.log('decrypt');
                method = 'decrypt';
            }
            // Encryption settings has been changed
            else if ( _.isEqual(this.configs, this.configsOld) === false ) {

                // ... (re)encryption
                console.log('(re)encryption');
                method = 'encrypt';
            }

            _.forEach(collections, function (collection, key) {
                var resp = self[method].apply(self, [collection]);

                $.when(resp).done(function () {
                    if (key === (collections.length - 1)) {
                        console.log('DONE collections');
                        done.resolve();
                    }
                });
            });

            return done;
        },

        encrypt: function (collection) {
            var done = $.Deferred(),
                data;

            collection.forEach(function (model, key) {
                this.auth.settings = this.configsOld;
                data = model.decrypt();

                this.auth.settings = this.configs;
                model.encrypt(data);

                model.save(model.toJSON(), {
                    success: function () {
                        if (key === (collection.length - 1)) {
                            console.log('DONE models');
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

            collection.forEach(function (model, key) {
                this.auth.settings = this.configsOld;

                model.save(model.decrypt(), {
                    success: function () {
                        if (key === (collection.length - 1)) {
                            done.resolve();
                        }
                        collection.trigger('decryption:progress');
                    }
                });
            }, this);

            return done;
        }

    };

    return ModelEncrypt;
});
