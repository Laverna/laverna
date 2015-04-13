/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'helpers/uri',
    'collections/notebooks',
    'models/notebook',
    'apps/notebooks/notebooksForm/formView'
], function(_, App, Marionette, URI, Notebooks, Notebook, FormView) {
    'use strict';

    var Form = App.module('AppNotebooks.NotebookForm');

    Form.Controller = Marionette.Controller.extend({
        initialize: function() {
            _.bindAll(this, 'addForm', 'editForm', 'show');

            this.collection = new Notebooks([], {
                comparator: 'name'
            });

            // Destroy when it's not under use
            this.on('destroy:it', this.destroy, this);
        },

        onDestroy: function() {
            this.view.trigger('destroy');
        },

        /*
         * Create form initializing
         */
        addForm: function(args) {
            this.model = new Notebook();
            this.isNew = true;
            this.args = args;

            // Set profile
            this.collection.database.getDB(args.profile);

            $.when(this.collection.fetch()).done(this.show);
        },

        /*
         * Edit form initializing
         */
        editForm: function(args) {
            this.model = new Notebook({id: args.id});
            this.args = args;

            // Set profile
            this.collection.database.getDB(args.profile);

            $.when(this.collection.fetch(), this.model.fetch()).done(this.show);
        },

        /*
         * Shows form
         */
        show: function() {
            var data = this.model.decrypt();

            this.view = new FormView ({
                collection: this.collection,
                model: this.model,
                data: data
            });

            App.modal.show(this.view);
            this.view.on('save', this.save, this);
            this.view.on('redirect', this.redirect, this);
        },

        /**
         * Saves changes
         */
        save: function() {
            var self = this,
                data = {
                    name     : this.view.ui.name.val(),
                    parentId : this.view.ui.parentId.val()
                };

            // First we need to encrypt data
            this.model.set(data).encrypt();

            this.model.save(this.model.toJSON(), {
                success: function(model) {
                    if (self.isNew === true) {
                        App.trigger('new:notebook', model);
                    }
                    self.view.trigger('redirect');
                }
            });
        },

        /*
         * Redirect
         */
        redirect: function() {
            if (_.isNull(this.args.redirect) || this.args.redirect === true) {
                return App.vent.trigger('navigate:link', '/notebooks');
            }
        }
    });

    return Form.Controller;
});
