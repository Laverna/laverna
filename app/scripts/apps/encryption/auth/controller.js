/*global define*/
define([
    'underscore',
    'app',
    'marionette',
    'apps/encryption/auth/authView'
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
            // var pwd = App.settings.encryptPass;
            var pwd = App.Encryption.API.encryptKey(password);
            if (pwd !== false) {
                App.secureKey = pwd;
                App.navigateBack('/notes', true);
            }
        }

    });

    return Form.Controller;
});
