/*global define*/
/*global sjcl*/
define([
    'underscore',
    'jquery',
    'backbone',
    'marionette',
    'models/notebook',
    'text!apps/notebooks/form/templates/form.html',
    'Mousetrap',
    'sjcl'
],
function (_, $, Backbone, Marionette, Notebook, Tmpl, Mousetrap) {
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
            Mousetrap.reset();
        },

        onFormShown: function () {
            this.ui.name.focus();
        },

        serializeData: function () {
            return _.extend(this.options.data, {
                notebooks: this.collection.toJSON()
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
         * Update existing notebook
         */
        /*
        update: function (data) {
            var self = this;

            this.model.set('name', data.name);
            this.model.set('parentId', data.parentId);

            // Handle validation errors
            this.model.on('invalid', function (model, errors) {
                self.showErrors(errors);
            });

            var result = this.model.save({}, {
                validate: true,
                success: function (result) {
                    if (result.validationError === null) {
                        self.close();
                        self.redirect();
                    }
                }
            });
        },
        */

        /**
         * Create new notebook
         */
        /*
        create: function (data) {
            data.id = this.collection.nextOrder();
            var self = this;

            var notebook = new Notebook(data, {validate: true});

            if ( !notebook.validationError) {
                var item = this.collection.create(notebook, {
                    success: function(model) {
                        self.redirect();
                        self.close();
                    }
                });
            } else {
                this.showErrors(notebook.validationError);
            }
        },
        */

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
