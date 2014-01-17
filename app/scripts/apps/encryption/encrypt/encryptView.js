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
            this.countMax();

            this.listenTo(this.options.notes, 'reset', this.countMax);
            this.listenTo(this.options.notebooks, 'reset', this.countMax);

            // Change encryption progress
            this.options.notes.on('progressEncryption', this.progress, this);
            this.options.notebooks.on('progressEncryption', this.progress, this);
        },

        checkPasswords: function (e) {
            e.preventDefault();

            this.trigger('checkPasswords', {
                newPass: this.ui.password.val().trim(),
                oldPass: this.ui.oldPass.val().trim(),
            });
        },

        countMax: function () {
            this.max = this.options.notes.length + this.options.notebooks.length;
            if (this.max === 0) {
                this.trigger('redirect');
            }
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
                this.trigger('redirect');
            }
        },

        serializeData: function () {
            return {
                max: this.max,
                oldPass: this.options.oldPass,
            };
        }

    });

    return View;
});
