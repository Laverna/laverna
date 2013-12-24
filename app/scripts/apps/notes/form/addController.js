/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'collections/notes',
    'collections/tags',
    'collections/notebooks',
    'models/note',
    'apps/notes/form/formView'
], function (_, App, Marionette, NotesCollection, TagsCollection, NotebooksCollection, NoteModel, View) {
    'use strict';

    var Form = App.module('AppNote.Form');

    Form.controller = Marionette.Controller.extend({
        initialize: function () {
            _.bindAll(this, 'addForm', 'editForm', 'show');
            App.trigger('notes:show', {filter: null, page: null});
        },

        addForm: function () {
            this.tagsCollection = new TagsCollection();
            this.notebooksCollection = new NotebooksCollection();
            this.model = new NoteModel();

            $.when(this.tagsCollection.fetch(), this.notebooksCollection.fetch())
                .done(this.show);
        },

        editForm: function (args) {
            this.tagsCollection = new TagsCollection();
            this.notebooksCollection = new NotebooksCollection();
            this.model = new NoteModel({id: args.id});

            $.when(this.tagsCollection.fetch(), this.notebooksCollection.fetch(),
                   this.model.fetch()).done(this.show);
        },

        show: function () {
            console.log(this.model);
            var view = new View({
                model: this.model,
                data: this.model.toJSON(),
                collectionTags: this.tagsCollection,
                notebooks: this.notebooksCollection
            });

            App.content.show(view);

            this.model.on('save', this.save, this);
            view.on('redirect', this.redirect, this);
            view.trigger('shown');
        },

        redirect: function () {
            var url = window.history;
            if (url.length === 0) {
                this.redirectToNote();
            } else {
                url.back();
            }
            return false;
        },

        save: function (data) {
            this.model.save(data, {
                success: function (model) {
                    var url = '/notes/show/' + model.get('id');
                    App.navigate(url, {trigger: true});
                }
            });

            App.trigger('notes:added');
        }
    });

    return Form.controller;
});
