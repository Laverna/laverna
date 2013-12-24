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

    var Edit = App.module('AppNote.Edit');

    Edit.Controller = Marionette.Controller.extend({
        initialize: function () {
            _.bindAll(this, 'form', 'show');
            App.trigger('notes:show');
        },

        form: function (args) {
            this.tagsCollection = new TagsCollection();
            this.notebooksCollection = new NotebooksCollection();
            this.model = new NoteModel({id: args.id});

            $.when(this.tagsCollection.fetch(), this.notebooksCollection.fetch(),
                   this.model.fetch()).done(this.show);
        },

        show: function () {
            var view = new View({
                model: this.model,
                data: this.model.toJSON(),
                collectionTags: this.tagsCollection,
                notebooks: this.notebooksCollection
            });

            App.content.show(view);

            this.model.on('save', this.save, this);
            view.trigger('shown');
        },

        save: function (data) {
            this.model.save(data, {
                success: function (model) {
                    var url = '/notes/show/' + model.get('id');
                    App.navigate(url, {trigger: true});
                }
            });
        }
    });

    return Edit.Controller;
});
