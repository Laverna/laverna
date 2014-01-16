/*global define*/
/*global sjcl*/
define([
    'underscore',
    'app',
    'jquery',
    'backbone',
    'marionette',
    'text!apps/settings/show/showTemplate.html',
    'sjcl'
], function (_, App, $, Backbone, Marionette, Tmpl) {
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
            var value, el; 
            var encryptSetChange = false;
            var encryptChange = false;
            var encrSet = [ 'encryptPass', 'encryptSalt', 'encryptIter', 'encryptTag', 'encryptKeySize' ];

            var oldConfigs = App.settings;

            _.each(this.changedSettings, function (settingName) {
                el = this.$('[name=' + settingName + ']');

                if (_.contains(encrSet, settingName)) {
                    encryptSetChange = true;
                }

                if (el.attr('type') !== 'checkbox') {
                    value = el.val();
                } else {
                    value = (el.is(':checked')) ? 1 : 0;
                }

                this.collection.trigger('changeSetting', {
                    name : settingName,
                    value: value
                });
            }, this);

            if (_.contains(this.changedSettings, 'encrypt') && oldConfigs.encrypt === false) {
                encryptChange = true;
            }

            this.trigger('encryption', {
                setChange: encryptSetChange,
                encryptChange: encryptChange,
                encrypt: this.$('[name="encrypt"]').is(':checked'),
                oldConfigs: oldConfigs,
                secureKey: this.$('[name="encryptPass"]').val()
            });

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
