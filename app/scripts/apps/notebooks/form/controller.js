/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'collections/notebooks',
    'models/notebook', 'apps/notebooks/form/formView' ], function (_, App, Marionette, Notebooks, Notebook, FormView) {
    'use strict';

    var Form = App.module('AppNotebooks.Form');
    
    Form.Controller = Marionette.Controller.extend({
        initialize: function () {
            _.bindAll(this, 'addForm', 'editForm', 'show');
        },

        // Create form initializing
        addForm: function () {
            this.collection = new Notebooks();
            this.model = new Notebook();

            $.when(this.collection.fetch()).done(this.show);
        },

        // Edit form initializing
        editForm: function (args) {
            this.collection = new Notebooks();
            this.model = new Notebook({id: parseInt(args.id)});

            $.when(this.collection.fetch(), this.model.fetch()).done(this.show);
        },

        // Shows form
        show: function () {
            if (this.model.get('id') === 0) {
                this.model.set('id', this.collection.nextOrder());
            }

            this.view = new FormView ({
                collection: this.collection,
                model: this.model,
                data: this.model.toJSON()
            });

            App.modal.show(this.view);
            this.model.on('save', this.save, this);
            this.view.on('redirect', this.redirect, this);
        },

        // Saving data or shows validation errors
        save: function (data) {
            var self = this;
            this.model.set(data, {validate: true});

            if (this.model.isValid()) {
                this.model.save(data, {
                    success: function () {
                        self.view.trigger('close');
                        self.redirect();
                    }
                });
            } else {
                this.view.showErrors(this.model.validationError);
            }
        },

        // Redirect
        redirect: function () {
            return App.navigate('#/notebooks');
        }
    });

    return Form.Controller;
});
