/*global define*/
define([
    'underscore',
    'jquery',
    'marionette',
    'text!apps/encryption/auth/template.html'
], function (_, $, Marionette, Tmpl) {
    'use strict';

    /**
     * Auth view.
     */
    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        events: {
            'submit .form-wrapper'  : 'login'
        },

        ui: {
            password : 'input[name=password]'
        },

        initialize: function () {
            this.on('shown', this.focusPassword, this);
        },

        focusPassword: function () {
            this.ui.password.focus();
        },

        login: function (e) {
            e.preventDefault();
            this.trigger('login', this.ui.password.val());
        }

    });

    return View;
});
