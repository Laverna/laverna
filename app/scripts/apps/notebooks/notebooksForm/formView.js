/*global define*/
define([
    'underscore',
    'jquery',
    'marionette',
    'models/notebook',
    'text!apps/notebooks/notebooksForm/templates/form.html'
], function (_, $, Marionette, Notebook, Tmpl) {
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

        events: {
            'submit .form-horizontal' : 'save',
            'click .ok'               : 'save',
            'click .cancelBtn'        : 'destroy'
        },

        modelEvents: {
            'invalid': 'showErrors'
        },

        initialize: function () {
            this.on('hidden.modal', this.redirect);
            this.on('shown.modal', this.onFormShown);
        },

        onFormShown: function () {
            this.ui.name.focus();
        },

        serializeData: function () {
            return _.extend(this.options.data, {
                notebooks: this.collection.decrypt()
            });
        },

        save: function (e) {
            e.preventDefault();

            this.model.trigger('save', {
                name     : this.ui.name.val(),
                parentId : this.ui.parentId.val()
            });
        },

        /**
         * Shows validation errors
         */
        showErrors: function (model, errors) {
            _.forEach(errors, function (err) {
                this.ui[err].parent().addClass('has-error');

                if (this.ui[err].attr('type') === 'text') {
                    this.ui[err].attr('placeholder', $.t('notebook.' + err));
                }
            }, this);
        },

        destroy: function (e) {
            if (e !== undefined) {
                e.preventDefault();
            }
            this.trigger('destroy');
        },

        redirect: function () {
            this.trigger('redirect');
        },

        templateHelpers: function () {
            return {
                i18n: $.t,

                isParent: function (notebookId, parentId) {
                    if (notebookId === parentId) {
                        return ' selected="selected"';
                    }
                }
            };
        }
    });

    return View;
});
