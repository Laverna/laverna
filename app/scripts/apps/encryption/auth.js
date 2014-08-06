/*global define*/
define([
    'sjcl'
], function (sjcl) {
    'use strict';

    var instance = null;

    function Auth (settings) {
        this.settings = settings;
        this.secureKey = null;

        if (window.sessionStorage) {
            this.session = window.sessionStorage;
        }
    }

    Auth.prototype = {

        checkAuth: function () {
            // Encryption is disabled
            if (this.settings.encrypt !== 1) {
                return true;
            }

            // Get secureKey from sessionStorage
            if ( !this.secureKey ) {
                this.secureKey = this.getKey();
            }

            return this.secureKey !== null;
        },

        /**
         * Cache encryption key within application
         */
        getSecureKey: function (password) {
            var pwd = this.settings.encryptPass,
                p = {};

            if (pwd.toString() === sjcl.hash.sha256.hash(password).toString()) {
                p.iter = Number(this.settings.encryptIter);
                p.salt = this.settings.encryptSalt;

                p = sjcl.misc.cachedPbkdf2(password, p);
                password = p.key.slice(0, Number(this.settings.encryptKeySize)/32);

                return this.saveKey(password);
            }
            else {
                return false;
            }
        },

        /**
         * Encrypt the content
         */
        encrypt: function (content) {
            if (!content || content === '' || !this.settings) {
                return content;
            }

            var secureKey = this.settings.secureKey || this.secureKey;
            if (Number(this.settings.encrypt) === 1 && secureKey) {
                var conf = this.settings,
                    p = {
                        iter : conf.encryptIter,
                        ts   : Number(conf.encryptTag),
                        ks   : Number(conf.encryptKeySize),
                        // Random initialization vector every time
                        iv   : sjcl.random.randomWords(4, 0)
                    };

                content = sjcl.encrypt(secureKey.toString(), content, p);
            }
            return content;
        },

        /**
         * Decrypt the content
         */
        decrypt: function (content) {
            if ( !content || content.length === 0 || !this.settings) {
                return content;
            }

            var secureKey = this.settings.secureKey || this.secureKey;
            if (this.settings.encrypt === 1 && secureKey) {
                try {
                    content = sjcl.decrypt(secureKey.toString(), content);
                }
                catch (e) {
                    if (console && typeof console.log === 'function') {
                        console.log('Can\'t decrypt ' + e);
                    }
                }
            }

            return content;
        },

        /**
         * Save secureKey to sessionStorage
         */
        saveKey: function (password) {
            this.secureKey = password;
            if ( this.session ) {
                this.session.setItem('secureKey', this.secureKey);
            }
            return this.secureKey;
        },

        /**
         * Get secureKey from sessionStorage
         */
        getKey: function () {
            if ( !this.session ) {
                return null;
            }
            return this.session.getItem('secureKey');
        },

        /**
         * Remove secureKey from sessionStorage
         */
        destroyKey: function () {
            this.secureKey = null;
            if (this.session) {
                this.session.removeItem('secureKey');
            }
        }

    };

    return function getSingleton (settings) {
        return (instance = (instance || new Auth(settings)));
    };

});
