/*global define*/
define([
    'underscore',
    'jquery',
    'marionette',
    'behaviors/modalForm',
    'models/notebook',
    'text!apps/notebooks/form/notebook/templates/form.html'
], function(_, $, Marionette, ModalForm, Notebook, Tmpl) {
    'use strict';

    /**
     * Notebook form view.
     */
    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        className: 'modal fade',

        ui: {
            name     : 'input[name="name"]',
            parentId : 'select[name="parentId"]'
        },

        behaviors: {
            ModalForm: {
                behaviorClass: ModalForm
            }
        },

        serializeData: function() {
            return _.extend(this.model.toJSON(), {
                notebooks: this.collection.toJSON()
            });
        },

        templateHelpers: function() {
            return {
                isParent: function(notebookId) {
                    if (this.parentId === notebookId) {
                        return ' selected="selected"';
                    }
                }
            };
        }
    });

    return View;
});
