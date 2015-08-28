/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'apps/encryption/auth/view'
], function(_, Marionette, Radio, View) {
    'use strict';

    /**
     * Auth controller. It shows authorization form.
     */
    var Controller = Marionette.Object.extend({

        initialize: function(options) {
            this.options = options;
            this.show();
        },

        onDestroy: function() {
            this.stopListening();
            Radio.command('global', 'region:empty', 'brand');
        },

        show: function() {
            this.view = new View();

            // Show auth form
            Radio.command('global', 'region:show', 'brand', this.view);
            this.view.trigger('shown');

            // Events
            this.listenTo(this.view, 'login', this.login);
        },

        login: function(pwd) {
            if (!Radio.request('encrypt', 'check:password', pwd)) {
                return this.view.trigger('invalid:password');
            }

            Radio.request('encrypt', 'save:secureKey', pwd)
            .then(function() {
                Radio.command('uri', 'back');
            });
        }

    });

    return Controller;
});
