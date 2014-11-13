/*global define*/
define([
    'underscore',
    'app',
    'marionette',
    'apps/encryption/auth',
    'apps/encryption/auth/authView'
], function (_, App, Marionette, getAuth, View) {
    'use strict';

    var Form = App.module('Encryption.Form');

    Form.Controller = Marionette.Controller.extend({

        initialize: function () {
            _.bindAll(this, 'showForm');

            this.auth = getAuth(App.settings);
        },

        showForm: function () {
            var form = new View();
            App.brand.show(form);

            form.trigger('shown');
            form.on('login', this.login, this);
        },

        login: function (password) {
            var pwd = this.auth.getSecureKey(password);
            if (pwd !== false) {
                App.vent.trigger('navigate:back', '/notes');
            }
        }

    });

    return Form.Controller;
});
