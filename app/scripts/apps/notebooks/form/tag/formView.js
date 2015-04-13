/* global define */
define([
    'underscore',
    'marionette',
    'behaviors/modalForm',
    'text!apps/notebooks/tagsForm/templates/form.html'
], function(_, Marionette, ModalForm, Templ) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Templ),

        className: 'modal fade',

        ui: {
            name : 'input[name="name"]'
        },

        behaviors: {
            ModalForm: {
                behaviorClass: ModalForm
            }
        },

        /**
         * Prepare model
         */
        serializeData: function() {
            return this.options.data;
        }
    });

    return View;
});
