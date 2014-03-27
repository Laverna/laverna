/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'collections/notes',
    'collections/tags',
    'collections/notebooks',
    'models/note',
    'apps/notes/form/formView',
    'checklist',
    'tags'
], function (_, App, Marionette, NotesCollection, TagsCollection, NotebooksCollection, NoteModel, View, Checklist, Tags) {
    'use strict';

    var Form = App.module('AppNote.Form');

    Form.Controller = Marionette.Controller.extend({
        initialize: function () {
            _.bindAll(this, 'addForm', 'editForm', 'show', 'redirectToNote');
            App.trigger('notes:show', {filter: null, page: null});

            this.tags = new TagsCollection();
            this.notebooks = new NotebooksCollection();
        },

        /**
         * Add a new note
         */
        addForm: function () {
            this.model = new NoteModel();

            $.when(
                this.tags.fetch(),
                this.notebooks.fetch()
            ).done(this.show);
        },

        /**
         * Edit an existing note
         */
        editForm: function (args) {
            this.model = new NoteModel({ id : args.id });

            $.when(
                this.tags.fetch({ limit : 100 }),
                this.notebooks.fetch(),
                this.model.fetch()
            ).done(this.show);
        },

        show: function () {
            var decrypted;

            decrypted = {
                title : App.Encryption.API.decrypt(this.model.get('title')),
                content : App.Encryption.API.decrypt(this.model.get('content')),
            };

            this.view = new View({
                model     : this.model,
                decrypted : decrypted,
                tags      : this.tags,
                notebooks : this.notebooks
            });

            App.content.show(this.view);

            this.model.on('save', this.save, this);
            this.view.on('redirect', this.redirect, this);
            this.view.trigger('shown');
        },

        save: function (data) {
            var notebook;

            // Get new data
            data.title = this.view.ui.title.val().trim();
            data.notebookId = parseInt(this.view.ui.notebookId.val().trim());

            // New notebook
            notebook = this.model.get('notebookId');
            if (data.notebookId !== notebook) {
                notebook = this.notebooks.get(data.notebookId);
                data.notebookId = notebook.get('id');
            }

            // Tasks
            var checklist = new Checklist().count(data.content);
            data.taskAll = checklist.all;
            data.taskCompleted = checklist.completed;

            // Tags
            data.tags = $.merge(new Tags().getTags(data.content), new Tags().getTags(data.title));

            // Encryption
            data.title = App.Encryption.API.encrypt(_.escape(data.title));
            data.content = App.Encryption.API.encrypt(data.content);

            // Save
            this.model.trigger('update:any');
            this.redirect = data.redirect;

            $.when(
                // Save changes
                this.model.save(data),
                // Add new tags
                this.tags.saveAdd(data.tags)
            ).done(this.redirectToNote);
        },

        redirect: function () {
            if (typeof(this.model.get('id')) === 'undefined') {
                App.navigateBack();
            } else {
                var url = '/notes/show/' + this.model.get('id');
                App.navigate(url, {trigger: true});
                App.trigger('notes:added', this.model.get('id'));
            }
            return false;
        },

        /**
         * Trigger event and redirect
         */
        redirectToNote: function () {
            var url;
            if (this.redirect === true) {
                url = '/notes/show/' + this.model.get('id');
            } else {
                url = '/notes/edit/' + this.model.get('id');
            }

            App.navigate(url, {trigger: true});
            App.trigger('notes:added', this.model.get('id'));
        }

    });

    return Form.Controller;
});
