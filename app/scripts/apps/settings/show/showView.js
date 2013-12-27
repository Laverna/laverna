/*global define*/
/*global sjcl*/
define([
    'underscore',
    'jquery',
    'backbone',
    'marionette',
    'text!apps/settings/show/showTemplate.html',
    'sjcl'
], function (_, $, Backbone, Marionette, Tmpl) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        className: 'modal fade',

        events: {
            'submit .form-horizontal' : 'save',
            'click .ok'               : 'save',
            'click .close'            : 'close',
            'click .showField'        : 'clickCheckbox',
            'click #randomize'        : 'randomize',
            'change input, select, textarea' : 'triggerChange'
        },

        ui: {
            saltInput     : 'input[name=encryptSalt]'
        },

        initialize: function () {
            this.on('hidden.modal', this.redirect);
            this.changedSettings = [];
        },

        triggerChange: function (e) {
            var el = $(e.target);
            this.changedSettings.push(el.attr('name'));
        },

        serializeData: function () {
            return {
                models: this.collection.getConfigs()
            };
        },

        randomize: function () {
            var random = sjcl.random.randomWords(2, 0);
            this.ui.saltInput.val(random);
            this.changedSettings.push(this.ui.saltInput.attr('name'));
            return false;
        },

        /**
         * Shows fieldsets with aditional parameters
         */
        clickCheckbox: function ( e ) {
            var input = $(e.currentTarget),
                field = $(input.attr('data-field'));

            if ( input.is(':checked') ) {
                field.css('display', 'block');
            } else {
                field.css('display', 'none');
            }
        },

        /**
         * Save the configs changes
         */
        save: function () {
            var value;

            _.each(this.changedSettings, function (settingName) {
                value = this.$('[name=' + settingName + ']').val();

                this.collection.trigger('changeSetting', {
                    name : settingName,
                    value: value
                });
            }, this);

            this.close();
            return false;
        },

        redirect: function () {
            this.trigger('redirect', this.changedSettings);
        },

        close: function (e) {
            if (e !== undefined) {
                e.preventDefault();
            }
            this.trigger('close');
        }

    });

    return View;
});
