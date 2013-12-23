/*global define*/
/*global sjcl*/
define([
    'underscore',
    'app',
    'sjcl'
], function (_, App) {
    'use strict';

    /**
     * This module provides encryption API
     */
    // For temporarily @TODO refactoring
    var Encryption = App.module('Encryption', function () {
        if (App.settings.encrypt === 1) {
            var password = '1',
                pwd = App.settings.encryptPass;

            if (pwd.toString() === sjcl.hash.sha256.hash(password).toString()) {
                App.settings.secureKey = sjcl.misc.pbkdf2(
                    password,
                    App.settings.encryptSalt.toString(),
                    1000
                ).toString();
            }
        }
    });

    /**
     * Encryption API
     */
    Encryption.API = {
        encrypt: function (content) {
            if (App.settings.encrypt === 1) {
                content = sjcl.encrypt(App.settings.secureKey.toString(), content);
            }

            return content;
        },

        decrypt: function (content) {
            if (App.settings.encrypt === 1) {
                try {
                    content = sjcl.decrypt(App.settings.secureKey, content);
                } catch(e) {
                    App.log('Can\'t decrypt ' + e);
                }
            }

            return content;
        }
    };

    return Encryption.API;
});
