/* global define */
define([
    'underscore',
    'jquery',
    'backbone',
    'marionette',
    'text!apps/encryption/encrypt/encryptTemplate.html'
], function (_, $, Backbone, Marionette, Tmpl) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        events: {
            'submit form': 'checkPasswords'
        },

        ui: {
            state: '#state',
            oldPass : 'input[name=oldpass]',
            password: 'input[name=password]',
            progress: '#encryption-progress',
            passForm: '#encryption-password'
        },

        initialize: function () {
            this.now = 0;
            this.max = this.options.notes.length + this.options.notebooks.length;

            this.listenTo(this.options.notes, 'reset', this.countMax);
            this.listenTo(this.options.notebooks, 'reset', this.countMax);

            // Change encryption progress
            this.options.notes.on('encryption:progress', this.progress, this);
            this.options.notebooks.on('encryption:progress', this.progress, this);
        },

        checkPasswords: function (e) {
            e.preventDefault();
            var data = {};

            if (this.options.passwords.new) {
                data.new = this.ui.password.val().trim();
            }

            if (this.options.passwords.old) {
                data.old = this.ui.oldPass.val().trim();
            }

            this.trigger('checkPasswords', data);
        },

        /**
         * Show encryption progress
         */
        progress: function () {
            this.ui.passForm.hide();
            this.ui.progress.removeClass('hide');

            this.now++;
            this.$('#progress').css('width', ((this.now * 100) / this.max) + '%' );
            if (this.now === this.max) {
                this.$('#progress').css('width', '100%' );
            }
        },

        serializeData: function () {
            return {
                max: this.max,
                passwords: this.options.passwords
            };
        },

        templateHelpers: function () {
            return {
                i18n: $.t
            };
        }
    });

    return View;
});
