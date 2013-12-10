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
            'click .ok'               : 'save'
        },

        initialize: function () {
            // Mousetrap.reset();
        },

        serializeData: function () {
            var models = [];
            _.forEach(this.collection.models, function (model) {
                models[model.get('name')] = model.get('value');
            });
            return {
                models: models
            };
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
