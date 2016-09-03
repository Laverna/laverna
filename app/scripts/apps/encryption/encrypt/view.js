/**
 * Copyright (C) 2015 Laverna project Authors.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'jquery',
    'underscore',
    'marionette',
    'backbone.radio',
    'text!apps/encryption/encrypt/template.html'
], function($, _, Marionette, Radio, Tmpl) {
    'use strict';

    /**
     * Re-encryption view.
     * Shows auth form or progress bar.
     */
    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        events: {
            'submit form': 'checkPasswords'
        },

        ui: {
            containerProgress : '#encryption-progress',
            containerForm     : '#encryption-password',

            progress          : '#progress',
            state             : '#state',

            // Passwords
            oldPassword       : 'input[name=oldpass]',
            password          : 'input[name=password]',
        },

        initialize: function() {
            this.progress = {count: 0, max: 0};
            this.vent    = Radio.channel('encrypt');

            // Events
            this.listenTo(Radio.channel('Encryption'), 'password:valid', this.showProgress);
            this.listenTo(this, 'encrypt:init', this.changeMax);

            this.listenTo(Radio.channel('collection'), 'saved:all', this.saveProgress);
            this.listenTo(this.vent, 'decrypting:models', this.decryptProgress);
            this.listenTo(this.vent, 'encrypting:models', this.encryptProgress);
        },

        changeMax: function(max) {
            this.progress.max = max;
        },

        saveProgress: function() {
            this._setProgress('encryption.state.save');
        },

        decryptProgress: function() {
            this._setProgress('encryption.state.decrypt');
        },

        encryptProgress: function() {
            this._setProgress('encryption.state.encrypt');
        },

        /**
         * Hide auth form and show progress bar.
         */
        showProgress: function() {
            this.ui.containerForm.hide();
            this.ui.containerProgress.removeClass('hide');
        },

        _setProgress: function(state) {
            var max = this.progress.max,
                width;

            // Change progress bar
            this.progress.count = (
                this.progress.count >= max ? 1 : this.progress.count + 1
            );
            width = Math.floor((this.progress.count * 100) / max);
            this.ui.progress.css('width', width + '%');

            // Change the status
            this.ui.state.text($.t(state));
        },

        checkPasswords: function(e) {
            e.preventDefault();

            this.trigger('check:passwords', {
                password : this.ui.password.length ? this.ui.password.val().trim() : null,
                old      : this.ui.oldPassword.length ? this.ui.oldPassword.val().trim() : null
            });
        },

        serializeData: function() {
            return {
                configs: this.options.configs
            };
        },

        templateHelpers: function() {
            return {
                needOldPassword: function() {
                    return (
                        (
                            // Backup password shouldn't be empty
                            (
                                !_.isUndefined(this.configs.encryptBackup.encryptPass) &&
                                this.configs.encryptBackup.encryptPass.length !== 0
                            ) &&
                            // Encryption should be enabled
                            (
                                _.isUndefined(this.configs.encryptBackup.encrypt) ||
                                Number(this.configs.encryptBackup.encrypt)
                            )
                        ) ||
                        // Encryption was disabled in new configs
                        (
                            !Number(this.configs.encrypt) &&
                            Number(this.configs.encryptBackup.encrypt)
                        )
                    );
                },

                needNewPassword: function() {
                    return Number(this.configs.encrypt);
                }
            };
        }

    });

    return View;
});
