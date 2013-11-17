/*global define*/
define([
    'underscore',
    'jquery',
    'backbone',
    'marionette',
    'models/notebook',
    'text!notebookFormTempl',
    'Mousetrap'
],
function (_, $, Backbone, Marionette, Notebook, Tmpl, Mousetrap) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        ui: {
            name     : 'input[name="name"]',
            parentId : 'select[name="parentId"]'
        },

        events: {
            'submit .form-horizontal': 'save'
        },

        initialize: function () {
            this.bind('ok', this.save);
            this.bind('hidden.bs.modal', this.close);
            Mousetrap.reset();
        },

        serializeData: function () {
            var model;

            if (this.model === undefined) {
                model = new this.options.collection.model();
            } else {
                model = this.model;
            }

            return _.extend(model.toJSON(), {
                notebooks: this.options.collection.toJSON()
            });
        },

        save: function (e) {
            if (e.$el === undefined) {
                e.preventDefault();
            } else {
                e.preventClose();
            }

            var data = {
                name     : this.ui.name.val(),
                parentId : parseInt(this.ui.parentId.val())
            };

            if (this.model !== undefined) {
                return this.update(data);
            } else {
                return this.create(data);
            }
        },

        /**
         * Update existing notebook
         */
        update: function (data) {
            var that = this;

            this.model.set('name', data.name);
            this.model.set('parentId', data.parentId);

            // Handle validation errors
            this.model.on('invalid', function (model, errors) {
                that.showErrors(errors);
            });

            var result = this.model.save({}, {validate: true});
            if (result) {
                this.redirect();
            }
        },

        /**
         * Create new notebook
         */
        create: function (data) {
            data.id = this.collection.nextOrder();

            var notebook = new Notebook(data, {validate: true});

            if ( !notebook.validationError) {
                this.collection.create(notebook);
                return this.redirect();
            } else {
                this.showErrors(notebook.validationError);
            }
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

        redirect: function () {
            Backbone.history.navigate('/notebooks', true);
        },

        close: function (m) {
            m.preventClose();
            this.redirect();
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
