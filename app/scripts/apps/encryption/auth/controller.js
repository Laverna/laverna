/*global define*/
/*global sjcl*/
define([
    'underscore',
    'app',
    'marionette',
    'apps/encryption/auth/authView',
    'sjcl'
], function (_, App, Marionette, View) {
    'use strict';

    var Form = App.module('Encryption.Form');

    Form.Controller = Marionette.Controller.extend({

        initialize: function () {
            _.bindAll(this, 'showForm');
        },

        showForm: function () {
            var form = new View();
            App.brand.show(form);

            form.trigger('shown');
            form.on('login', this.login, this);
        },

        login: function (password) {
            // password = '1',
            var pwd = App.settings.encryptPass;

            if (pwd.toString() === sjcl.hash.sha256.hash(password).toString()) {
                App.settings.secureKey = sjcl.misc.pbkdf2(
                    password,
                    App.settings.encryptSalt.toString(),
                    1000
                ).toString();
                App.navigateBack('/notes', true);
            }
        }

    });

    return Form.Controller;
});
