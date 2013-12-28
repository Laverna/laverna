/*global define*/
define([
    'underscore',
    'jquery',
    'app',
    'backbone',
    'marionette',
    'models/notebook',
    'text!apps/notebooks/form/templates/form.html'
],
function (_, $, App, Backbone, Marionette, Notebook, Tmpl) {
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
            'click .cancelBtn'        : 'close'
        },

        initialize: function () {
            this.on('hidden.modal', this.redirect);
            this.on('shown.modal', this.onFormShown);
        },

        onFormShown: function () {
            this.ui.name.focus();
        },

        serializeData: function () {
            var data = this.model.toJSON();

            data.name = App.Encryption.API.decrypt(data.name);

            return _.extend(data, {
                notebooks: this.collection.decrypt()
            });
        },

        save: function (e) {
            e.preventDefault();

            var data = {
                name     : this.ui.name.val(),
                parentId : parseInt(this.ui.parentId.val())
            };

            this.model.trigger('save', data);
        },

        /**
         * Shows validation errors
         */
        showErrors: function (errors) {
            var that = this;
            _.each(errors, function (e) {
                if (e === 'name') {
                    that.$('#notebook-name').addClass('has-error');
                    that.ui.name.attr('placeholder', 'Notebook name is required');
                }
            });
        },

        close: function (e) {
            if (e !== undefined) {
                e.preventDefault();
            }
            this.trigger('close');
        },

        redirect: function () {
            this.trigger('redirect');
        },

        templateHelpers: function () {
            return {
                isParent: function (notebookId, parentId) {
                    var selected = '';
                    if (parseInt(notebookId) === parseInt(parentId)) {
                        selected = ' selected="selected"';
                    }
                    return selected;
                }
            };
        }
    });

    return View;
});
