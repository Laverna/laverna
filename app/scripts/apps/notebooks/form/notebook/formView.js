/*global define*/
define([
    'underscore',
    'jquery',
    'marionette',
    'behaviors/modalForm',
    'models/notebook',
    'text!apps/notebooks/notebooksForm/templates/form.html'
], function(_, $, Marionette, ModalForm, Notebook, Tmpl) {
    'use strict';

    /**
     * Notebook form
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
            return _.extend(this.options.data, {
                notebooks: this.collection.decrypt()
            });
        },

        templateHelpers: function() {
            return {
                isParent: function(notebookId, parentId) {
                    if (notebookId === parentId) {
                        return ' selected="selected"';
                    }
                }
            };
        }
    });

    return View;
});
