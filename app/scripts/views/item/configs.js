/*global define*/
/*global sjcl*/
/*global Mousetrap*/
define([
    'underscore',
    'jquery',
    'backbone',
    'marionette',
    'text!configsTempl',
    'sjcl'
], function (_, $, Backbone, Marionette, Tmpl) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        className: 'modal-dialog',

        events: {
            'submit .form-horizontal' : 'save',
            'click .ok'               : 'save',
            'click .close'            : 'close',
            'click .showField'        : 'clickCheckbox',
            'click #randomize'        : 'randomize'
        },

        ui: {
            saltInput     : 'input[name=encryptSalt]'
        },

        initialize: function () {
            this.on('hidden', this.redirect);
            Mousetrap.reset();
        },

        serializeData: function () {
            return {
                models: this.collection.getConfigs()
            };
        },

        randomize: function () {
            var random = sjcl.random.randomWords(2, 0);
            this.ui.saltInput.val(random);
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
         * Save the configs
         */
        save: function () {
            var elem,
                value;

            _.forEach(this.collection.models, function (model) {
                elem = this.$('[name="' + model.get('name') + '"]');
                value = '';
                switch(elem.attr('type')) {
                    case 'checkbox':
                        value = elem.is(':checked') ? 1 : 0;
                        break;
                    default:
                        value = elem.val();
                }

                // Save only if value is changed
                if (value.toString() !== model.get('value')) {
                    model.save('value', value);
                }
            }, this);

            return this.redirect();
        },

        redirect: function () {
            Backbone.history.navigate('/', true);
            window.location.reload();
            return false;
        },

        close: function (e) {
            e.preventDefault();
            this.trigger('close');
        }

    });

    return View;
});
