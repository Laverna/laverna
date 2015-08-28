/* global define */
define([
    'underscore',
    'marionette',
    'behaviors/modalForm',
    'text!apps/notebooks/form/tag/templates/form.html'
], function(_, Marionette, ModalForm, Templ) {
    'use strict';

    /**
     * Tag form view.
     */
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
        }
    });

    return View;
});
