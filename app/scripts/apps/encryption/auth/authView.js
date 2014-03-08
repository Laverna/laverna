/*global define*/
define([
    'underscore',
    'jquery',
    'backbone',
    'marionette',
    'text!apps/encryption/auth/template.html'
], function ( _, $, Backbone, Marionette, Tmpl) {
    'use strict';

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
        },

        templateHelpers: function () {
            return {
                i18n: $.t
            };
        }
    });

    return View;
});
