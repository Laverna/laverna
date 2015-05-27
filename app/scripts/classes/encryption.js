/* global define */
define([
    'q',
    'underscore',
    'marionette',
    'backbone.radio',
    'sjcl'
], function(Q, _, Marionette, Radio, sjcl) {
    'use strict';

    /**
     * Encryption class.
     *
     * Complies to commands on channel `encrypt`:
     * 1. `change:configs`   - changes encryption configs.
     * 2. `delete:secureKey` - delete PBKDF2 from session storage.
     *
     * Replies to requests on channel `encrypt`:
     * 1. `sha256`          - generates and returns sha256 hash of provided string.
     * 2. `randomize`       - generates and returns random data.
     *
     * 3. `check:auth`      - checks whether a user is authorized.
     * 4. `check:password`  - validate provided password.
     * 5. `save:secureKey`  - compute PBKDF2 and save it to session storage.
     *
     * 6. `encrypt`         - encrypt a string
     * 7. `decrypt`         - decrypt a string
     * 8. `encrypt:model`   - encrypt a Backbone model
     * 9. `decrypt:model`   - decrypt a Backbone model
     * 10. `encrypt:models` - encrypt a Backbone collection
     * 11. `decrypt:models` - decrypt a Backbone collection
     */
    var Encrypt = Marionette.Object.extend({

        initialize: function() {
            // Get configs
            this.configs = Radio.request('configs', 'get:object');
            this.options = {};

            // Complies
            Radio.comply('encrypt', {
                'change:configs'   : this.changeConfigs,
                'delete:secureKey' : this.deleteSecureKey
            }, this);

            // Replies
            Radio.reply('encrypt', {
                'sha256'           : this.sha256,
                'randomize'        : this.randomize,

                // Check auth/password
                'check:auth'       : this.checkAuth,
                'check:password'   : this.checkPassword,
                'save:secureKey'   : this.saveSecureKey,

                // Encrypt/decrypt some string
                'encrypt'          : this.encrypt,
                'decrypt'          : this.decrypt,

                // Encrypt/decrypt a model
                'encrypt:model'    : this.encryptModel,
                'decrypt:model'    : this.decryptModel,

                // Encrypt/decrypt a collection of models
                'encrypt:models'   : this.encryptModels,
                'decrypt:models'   : this.decryptModels
            }, this);
        },

        /**
         * Change encryption configs. It is useful when re-encrypting data.
         */
        changeConfigs: function(configs) {
            configs      = configs || Radio.request('configs', 'get:object');
            this.configs = _.extend(this.configs, configs);
        },

        sha256: function(str) {
            return sjcl.hash.sha256.hash(str);
        },

        /**
         * Generate PBKDF2 and save it. It will be used to encrypt/decrypt data.
         * @return promise
         */
        saveSecureKey: function(password) {
            var self  = this;

            return new Q(this._getKey(password))
            .then(function(keys) {
                self.options.key    = keys.key;
                self.options.hexKey = keys.hexKey;
                self._saveSession();
            });
        },

        /**
         * Delete current PBKDF2.
         */
        deleteSecureKey: function() {
            this.options = {};

            if (window.sessionStorage) {
                window.sessionStorage.removeItem(this._getSessionKey());
            }
        },

        /**
         * Check whether a user is already authorized
         * @return bool
         */
        checkAuth: function() {
            /**
             * If encryption backup is not empty, it means a user changed
             * encryption settings.
             */
            if (!_.isEmpty(this.configs.encryptBackup)) {
                Radio.trigger('encrypt', 'changed');
                return true;
            }

            // Encryption is disabled
            if (!Number(this.configs.encrypt) || this.configs.encryptPass === '') {
                return true;
            }

            return !_.isEmpty(this.options) || this._getSession() !== null;
        },

        /**
         * Check the password with the password in the database which is saved
         * in there in sha256 hash format. Note, just the password is not used
         * for encrypting/decrypting data. We use instead PBKDF2.
         * @return bool
         */
        checkPassword: function(password) {
            var pwd = this.configs.encryptPass;
            return this.sha256(password).toString() === pwd.toString();
        },

        /**
         * Generates random words.
         * @return string
         */
        randomize: function(number, paranoia) {
            return this._hex(sjcl.random.randomWords(number, paranoia));
        },

        /**
         * Encrypt a string.
         * @return object
         */
        encrypt: function(str) {
            // Encryption is disabled
            if (str === '' || !Number(this.configs.encrypt)) {
                return str;
            }

            var p = this._getConfigs();
            str   = sjcl.encrypt(this.options.hexKey, str, p);

            // Return only encrypted data and initialization vector
            str = _.pick(JSON.parse(str), 'ct', 'iv');
            return JSON.stringify(str);
        },

        /**
         * Decrypt a string.
         * @return string
         */
        decrypt: function(str) {
            // Encryption is disabled
            if (str === '' || !Number(this.configs.encrypt)) {
                return str;
            }

            var key = this.options.key,
                object;

            try {
                object = JSON.parse(str);
            } catch (e) {
                return str;
            }

            // We need more encryption data
            if (!_.has(object, 'mode')) {
                key = this.options.hexKey;
                str = _.extend(this._getConfigs(), object);
                str = JSON.stringify(str);
            }

            try {
                str = sjcl.decrypt(key, str);
            } catch (e) {
                // Trigger error event
                Radio.trigger('encrypt', 'decrypt:error', e);
                console.error('Decryption error', e, this.options.hexKey);
                throw new Error('Decryption error');
            }

            return str;
        },

        /**
         * Encrypt a model.
         * @return object
         */
        encryptModel: function(model) {
            _.each(model.encryptKeys, function(key) {
                model.set(key, this.encrypt(model.get(key)));
            }, this);

            Radio.trigger('encrypt', 'encrypted:model', model);
            return model.toJSON();
        },

        /**
         * Decrypt a model.
         * @return object
         */
        decryptModel: function(model) {
            _.each(model.encryptKeys, function(key) {
                model.set(key, this.decrypt(model.get(key)));
            }, this);

            Radio.trigger('encrypt', 'decrypted:model', model);
            return model.toJSON();
        },

        /**
         * Encrypt a collection.
         * @return promise
         */
        encryptModels: function(collection) {
            var promises = [],
                self     = this;

            // The collection is empty or PBKDF2 wasn't generated
            if (!collection.length || !this.options.key) {
                return new Q();
            }

            Radio.trigger('encrypt', 'encrypting:models', collection);

            collection.each(function(model) {
                promises.push(new Q(self.encryptModel(model)));
            }, this);

            return Q.all(promises);
        },

        /**
         * Decrypt a collection.
         * @return promise
         */
        decryptModels: function(collection) {
            var promises = [],
                self     = this;

            // The collection is empty
            if (!collection.length) {
                return new Q();
            }

            // PBKDF2 wasn't generated
            if (!this.options.key) {
                return new Q(Radio.trigger('encrypt', 'decrypt:error'));
            }

            Radio.trigger('encrypt', 'decrypting:models', collection);

            collection.each(function(model) {
                promises.push(new Q(self.decryptModel(model)));
            }, this);

            return Q.all(promises);
        },

        /**
         * Compute PBKDF2 which will be used to encrypt/decrypt data
         */
        _getKey: function(password) {
            var pbkdf2 = {};

            if (!Number(this.configs.encrypt)) {
                return {};
            }

            pbkdf2.iter = Number(this.configs.encryptIter);
            pbkdf2.salt = this.configs.encryptSalt;

            pbkdf2   = sjcl.misc.cachedPbkdf2(password, pbkdf2);
            password = pbkdf2.key.slice(0, Number(this.configs.encryptKeySize) / 32);

            return {
                key    : password,
                hexKey : this._hex(password)
            };
        },

        /**
         * Save PBKDF2 to sessionStorage. That way the user will not have to
         * type their passwords every time.
         */
        _saveSession: function() {
            if (!window.sessionStorage || !this.options) {
                return;
            }
            window.sessionStorage.setItem(
                this._getSessionKey(),
                JSON.stringify(this.options)
            );
        },

        /**
         * Get PBKDF2 from sessionStorage.
         */
        _getSession: function() {
            if (!window.sessionStorage) {
                return null;
            }

            var options  = window.sessionStorage.getItem(this._getSessionKey());
            try {
                options = JSON.parse(options);
                this.options = options || this.options;
            } catch (e) {
                options = null;
            }

            return options;
        },

        /**
         * Return session storage key which will be used to save PBKDF2.
         */
        _getSessionKey: function() {
            var profile = Radio.request('uri', 'profile') || 'default';
            profile = (Number(this.configs.useDefaultConfigs) ? 'default' : profile);
            return 'secureKey.' + profile;
        },

        /**
         * Return encryption configs.
         */
        _getConfigs: function() {
            return {
                mode   : 'ccm',
                iter   : Number(this.configs.encryptIter),
                ts     : Number(this.configs.encryptTag),
                ks     : Number(this.configs.encryptKeySize),
                salt   : this.configs.encryptSalt,
                v      : 1,
                adata  : '',
                cipher : 'aes',
                // Random initialization vector every time
                iv     : sjcl.random.randomWords(4, 0)
            };
        },

        _hex: function(str) {
            str = sjcl.codec.hex.fromBits(str);
            str = str.toUpperCase().replace(/ /g,'').replace(/(.{8})/g, '$1 ').replace(/ $/, '');
            return str;
        }

    });

    // Initialize
    Radio.command('init', 'add', 'app:before', function() {
        new Encrypt();
    });

    return Encrypt;
});
