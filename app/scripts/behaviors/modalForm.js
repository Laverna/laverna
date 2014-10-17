/* global define */
define([
    'underscore',
    'marionette',
    'behaviors/modal'
], function(_, Marionette, ModalBehavior) {
    'use strict';

    var ModalForm = Marionette.Behavior.extend({
        behaviors: {
            ModalBehavior: {
                behaviorClass: ModalBehavior
            }
        },

        defaults: {
            uiFocus: 'name'
        },

        events: { },

        triggers: {
            'submit .form-horizontal' : 'save',
            'click .ok'               : 'save',
            'click .cancelBtn'        : 'close'
        },

        modelEvents: {
            'invalid': 'showErrors'
        },

        initialize: function() {
            this.events['keyup @ui.' + this.options.uiFocus] = 'closeOnEsc';
            this.view.on('shown.modal', this.onFormShown, this);
        },

        onFormShown: function() {
            this.view.ui[this.options.uiFocus].focus();
        },

        /**
         * Triggers 'close' event when user hits ESC
         */
        closeOnEsc: function(e) {
            if (e.which === 27) {
                this.view.trigger('close');
            }
        },

        /**
         * Shows validation errors
         */
        showErrors: function(model, errors) {
            _.forEach(errors, function(err) {
                this.view.ui[err].parent().addClass('has-error');

                if (this.view.ui[err].attr('type') === 'text') {
                    this.view.ui[err].attr('placeholder', $.t(model.storeName + '.' + err));
                }
            }, this);
        }
    });

    return ModalForm;
});
