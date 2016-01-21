/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'underscore',
    'q',
    'sjcl'
], function(_, Q, sjcl) {
    'use strict';

    /**
     * Sjcl adapter
     */
    function Sjcl() {
    }

    _.extend(Sjcl.prototype, {
        keys: [],

        /**
         * Convert a string to a HEX.
         *
         * @type string str
         * @return string
         */
        hex: function(str) {
            return sjcl.codec.hex.fromBits(str);
        },

        /**
         * Replace every letter in a HEX string with uppercased letters.
         *
         * @type string str
         * @return string
         */
        toUpperCase: function(str) {
            return str.toUpperCase().replace(/ /g,'').replace(/(.{8})/g, '$1 ').replace(/ $/, '');
        },

        /**
         * Hash a string.
         *
         * @type string str
         * @return promise
         */
        sha256: function(str) {

            // Don't try to compute SHA256 if a string is empty
            if (!str || !str.length) {
                return new Q(str);
            }

            return new Q(sjcl.hash.sha256.hash(str));
        },

        /**
         * Return encryption configs.
         *
         * @type object configs
         * @return object
         */
        getConfigs: function(configs) {
            return {
                mode   : 'ccm',
                iter   : Number(configs.encryptIter),
                ts     : Number(configs.encryptTag),
                ks     : Number(configs.encryptKeySize),
                salt   : configs.encryptSalt,
                v      : 1,
                adata  : '',
                cipher : 'aes',
            };
        },

        /**
         * Compute PBKDF2 which will be used to encrypt/decrypt data
         *
         * @type object data
         * @return object
         */
        deriveKey: function(data) {

            // If encryption is disabled, don't compute PBKDF2
            if (!Number(data.configs.encrypt)) {
                return {};
            }

            var pbkdf2 = {},
                password;

            pbkdf2.iter = Number(data.configs.encryptIter);
            pbkdf2.salt = data.configs.encryptSalt;

            pbkdf2   = sjcl.misc.cachedPbkdf2(data.password, pbkdf2);
            password = pbkdf2.key.slice(0, Number(data.configs.encryptKeySize) / 32);

            return (this.keys = {
                key    : password,
                hexKey : sjcl.codec.hex.fromBits(password)
            });
        },

        /**
         * Returns either locally cached keys or the keys from the provided object.
         *
         * @type object data
         * @return object
         */
        getKeys: function(data) {
            return data.keys || this.keys;
        },

        /**
         * Encrypt data.
         *
         * @type object data
         * @return string
         */
        encrypt: function(data) {

            // Encryption is disabled
            if (!data.string || !Number(data.configs.encrypt)) {
                return data.string;
            }

            var p = this.getConfigs(data.configs);

            // Random initialization vector every time
            p.iv  = data.iv;

            if (typeof data.string !== 'string') {
                data.string = JSON.stringify(data.string);
            }

            data.string = sjcl.encrypt(this.getKeys(data).key, data.string, p);
            return data.string;
        },

        /**
         * Decrypt data.
         *
         * @type object data
         * @return [string|object]
         */
        decrypt: function(data) {

            // Encryption is disabled
            if ((!data.string || !data.string.length) ||
                !Number(data.configs.encrypt)) {
                return data.string;
            }

            try {
                data.string = sjcl.decrypt(this.getKeys(data).key, data.string);
            } catch (e) {
                return this.triggerDecryptError(e, data.string);
            }

            return data.string;
        },

        /**
         * Deprecated decryption.
         *
         * @type object data
         * @return string
         */
        decryptLegacy: function(data) {

            // Encryption is disabled
            if ((!data.string || !data.string.length) ||
                !Number(data.configs.encrypt)) {
                return data.string;
            }

            var keys = this.getKeys(data),
                key  = keys.key.toString(),
                str,
                object;

            try {
                str    = _.unescape(data.string);
                object = JSON.parse(data.string);
            } catch (e) {
                return data.string;
            }

            // We need more encryption data
            if (_.size(object) < 9) {
                key = this.toUpperCase(keys.hexKey);
                str = _.extend(this.getConfigs(data.configs), object);
                str = JSON.stringify(str);
            }

            try {
                str = sjcl.decrypt(key, str);
            } catch (e) {
                return this.triggerDecryptError(e, str);
            }

            return str;
        },

        triggerDecryptError: function(e, str) {

            // The text wasn't encrypted
            if (e.message.search('json decode') > -1 &&
               !/"ct":"([^"]*)"./.test(str)) {
                return str;
            }

            console.error('Decryption error', e, str);
            throw new Error(e.message);
        }

    });

    return Sjcl;
});
