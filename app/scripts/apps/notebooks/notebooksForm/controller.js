/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'helpers/uri',
    'collections/notebooks',
    'models/notebook',
    'apps/notebooks/notebooksForm/formView'
], function (_, App, Marionette, URI, Notebooks, Notebook, FormView) {
    'use strict';

    var Form = App.module('AppNotebooks.NotebookForm');

    Form.Controller = Marionette.Controller.extend({
        initialize: function () {
            _.bindAll(this, 'addForm', 'editForm', 'show');
        },

        // Create form initializing
        addForm: function (args) {
            this.collection = new Notebooks();
            this.model = new Notebook();
            this.isNew = true;
            this.args = args;

            // Set profile
            this.collection.database.getDB(args.profile);

            $.when(this.collection.fetch()).done(this.show);
        },

        // Edit form initializing
        editForm: function (args) {
            this.collection = new Notebooks();
            this.model = new Notebook({id: parseInt(args.id)});

            // Set profile
            this.collection.database.getDB(args.profile);

            $.when(this.collection.fetch(), this.model.fetch()).done(this.show);
        },

        // Shows form
        show: function () {
            if (this.model.get('id') === 0) {
                this.model.set('id', this.collection.nextOrder());
            }

            var data = this.model.toJSON();
            data.name = App.Encryption.API.decrypt(data.name);

            this.view = new FormView ({
                collection: this.collection,
                model: this.model,
                data: data
            });

            App.modal.show(this.view);
            this.model.on('save', this.save, this);
            this.view.on('redirect', this.redirect, this);
        },

        // Saving data or shows validation errors
        save: function (data) {
            var self = this;

            data.name = App.Encryption.API.encrypt(_.escape(data.name));

            this.model.set(data, {validate: true});

            if (this.model.isValid()) {
                this.model.save(data, {
                    success: function (model) {
                        if (self.isNew === true) {
                            App.trigger('new:notebook', model);
                        }

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
            return App.navigate('#' + URI.link('/notebooks'));
        }
    });

    return Form.Controller;
});
