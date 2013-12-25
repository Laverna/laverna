/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'collections/tags',
    'models/tag',
    'apps/notebooks/tagsForm/formView'
], function (_, App, Marionette, Collection, Model, FormView) {
    'use strict';
    
    var Form = App.module('AppNotebooks.TagsForm');

    Form.Controller = Marionette.Controller.extend({
        initialize: function () {
            _.bindAll(this, 'addForm', 'editForm', 'show');
        },

        addForm: function () {
            this.collection = new Collection();
            this.model = new Model();

            $.when(this.collection.fetch()).done(this.show);
        },

        editForm: function (args) {
            this.collection = new Collection();
            this.model = new Model({id: parseInt(args.id)});
            console.log(this.model);

            $.when(this.collection.fetch(), this.model.fetch()).done(this.show);
        },

        show: function () {
            if (this.model.get('id') === 0) {
                this.model.set('id', this.collection.nextOrder());
            }

            this.view = new FormView({
                model: this.model,
                data: this.model.toJSON()
            });

            App.modal.show(this.view);

            this.model.on('save', this.save, this);
            this.view.on('redirect', this.redirect, this);
        },

        save: function (data) {
            var self = this;
            this.model.set(data);

            if (this.model.isValid()) {
                this.model.save(data, {
                    success: function () {
                        self.view.trigger('close');
                    }
                });
            } else {
                this.view.showErrors(this.model.validationError);
            }
        },
        
        redirect: function () {
            return App.navigate('#/notebooks');
        }
    });

    return Form.Controller;
});
