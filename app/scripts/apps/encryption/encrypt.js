/*global define*/
/*global sjcl*/
define([
    'underscore',
    'app',
    'sjcl'
], function (_, App) {
    'use strict';

    // For temporarily @TODO refactoring
    var Encrypt = App.module('encryption', function () {
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

    return Encrypt;
});
