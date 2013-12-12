/*global define*/
// /*global Mousetrap*/
define([
    'underscore',
    'jquery',
    'backbone',
    'marionette',
    'text!configsTempl'
], function (_, $, Backbone, Marionette, Tmpl) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        className: 'modal-dialog',

        events: {
            'submit .form-horizontal' : 'save',
            'click .ok'               : 'save',
            'click input[type="checkbox"]': 'clickCheckbox'
        },

        ui: {
            encryptionPass: '#encryption-pass'
        },

        initialize: function () {
            // Mousetrap.reset();
        },

        serializeData: function () {
            return {
                models: this.collection.getConfigs()
            };
        },

        clickCheckbox: function ( e ) {
            if ( e.currentTarget === this.$('input[name="use-encryption"]')[0] ) {
                if ( this.$('input[name="use-encryption"]').is(':checked') ) {
                    this.ui.encryptionPass.css('display', 'block');
                } else {
                    this.ui.encryptionPass.css('display', 'none');
                }
            }
        },

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
                model.save('value', value);
            }, this);

            this.trigger('close');
            return false;
        }
    });

    return View;
});
