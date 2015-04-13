/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'helpers/uri',
    'models/tag',
    'apps/notebooks/tagsForm/formView'
], function(_, App, Marionette, URI, Model, FormView) {
    'use strict';

    var Form = App.module('AppNotebooks.TagsForm');

    Form.Controller = Marionette.Controller.extend({
        initialize: function() {
            _.bindAll(this, 'addForm', 'editForm', 'show');
            this.on('destroy:it', this.destroy, this);
        },

        onBeforeDestroy: function() {
            this.view.trigger('destroy');
        },

        /*
         * Add a new tag
         */
        addForm: function(args) {
            // Set profile
            this.model = new Model();
            this.model.database.getDB(args.profile);
            this.show();
        },

        /*
         * Edit an existing tag
         */
        editForm: function(args) {
            // Set profile
            this.model = new Model({id: args.id});
            this.model.database.getDB(args.profile);

            $.when(this.model.fetch()).done(this.show);
        },

        show: function() {
            this.view = new FormView({
                model: this.model,
                data: this.model.toJSON()
            });

            App.modal.show(this.view);

            this.view.on('save', this.save, this);
            this.view.on('redirect', this.redirect, this);
        },

        save: function() {
            var self = this,
                data = { name: this.view.ui.name.val() };

            this.model.set(data);
            this.model.updateDate();

            this.model.save(data, {
                success: function() {
                    self.view.trigger('redirect');
                }
            });
        },

        redirect: function() {
            return App.vent.trigger('navigate:link', '/notebooks');
        }
    });

    return Form.Controller;
});
