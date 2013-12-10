/*global define */
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
            'click .cancelBtn'        : 'close'
        },

        initialize: function () {
            Mousetrap.reset();
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

        save: function (e) {
            var elem;
            var value;
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

            e.preventDefault();
        }
    });

    return View;
});
