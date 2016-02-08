/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'sjcl',
    'apps/settings/show/formBehavior',
    'text!apps/settings/show/templates/encryption.html'
], function(_, Marionette, Radio, sjcl, FormBehavior, Tmpl) {
    'use strict';

    /**
     * Encryption settings.
     */
    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        behaviors: {
            FormBehavior: {
                behaviorClass: FormBehavior.extend({

                    /**
                     * Prevent from saving an empty password.
                     */
                    triggerChange: function(e) {
                        var $e = $(e.currentTarget);

                        if ($e.attr('name') !== 'encryptPass' || $e.val().length) {
                            $e.parent().parent().removeClass('has-error');
                            FormBehavior.prototype.triggerChange.apply(this, arguments);
                            return;
                        }

                        $e.parent().parent().addClass('has-error');
                    }
                })
            }
        },

        ui: {
            settings  : '#encryptOpt',
            saltInput : 'input[name=encryptSalt]',
            password  : 'input[name=encryptPass]'
        },

        events: {
            'click #useEncryption' : 'toggleSettings',
            'click #randomize'     : 'randomize',
            'blur @ui.password'    : 'randomizeOnPassword'
        },

        serializeData: function() {
            return {models  : this.collection.getConfigs()};
        },

        templateHelpers: function() {
            return {
                hex: function(str) {
                    if (typeof str === 'string') {
                        return str;
                    }

                    return sjcl.codec.hex.fromBits(str);
                },

                passwordText: function() {
                    if (this.models.encryptPass.length !== 0) {
                        return $.t('encryption.change password');
                    }
                    return $.t('encryption.provide password');
                },
            };
        },

        initialize: function() {
            sjcl.random.startCollectors();
        },

        onDestroy: function() {
            sjcl.random.stopCollectors();
        },

        /**
         * Toggle active status of encryption settings.
         */
        toggleSettings: function() {
            var state = this.ui.settings.attr('disabled') !== 'disabled';
            this.ui.settings.attr('disabled', state);
        },

        /**
         * Automatically generate new encryption salt every time the password is
         * changed.
         */
        randomizeOnPassword: function() {
            if (!this.ui.password.val().trim().length) {
                return;
            }

            this.randomize();
        },

        /**
         * Generate random salt.
         */
        randomize: function() {
            var random = Radio.request('encrypt', 'randomize', 5, 0);
            this.ui.saltInput.val(random).trigger('change');
            return false;
        }

    });

    return View;
});
