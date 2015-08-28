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
                behaviorClass: FormBehavior
            }
        },

        ui: {
            settings  : '#encryptOpt',
            saltInput : 'input[name=encryptSalt]',
            password  : 'input[name=encryptPass]'
        },

        events: {
            'click #useEncryption' : 'toggleSettings',
            'click #randomize'     : 'randomize'
        },

        serializeData: function() {
            return {models  : this.collection.getConfigs()};
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
         * Generate random salt.
         */
        randomize: function() {
            var random = Radio.request('encrypt', 'randomize', 3, 0);
            this.ui.saltInput.val(random).trigger('change');
            return false;
        }

    });

    return View;
});
