/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'collections/notes',
    'collections/tags',
    'collections/notebooks',
    'collections/files',
    'models/note',
    'apps/notes/form/formView'
], function (_, App, Marionette, NotesCollection, TagsCollection, NotebooksCollection, FilesCollection, NoteModel, View) {
    'use strict';

    var Form = App.module('AppNote.Form');

    Form.Controller = Marionette.Controller.extend({
        initialize: function () {
            _.bindAll(this, 'addForm', 'editForm', 'show', 'redirectToNote');
            App.trigger('notes:show', {filter: null, page: null});

            this.tags = new TagsCollection();
            this.notebooks = new NotebooksCollection();
            this.files = new FilesCollection();
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
            var view, decrypted;

            decrypted = {
                title : App.Encryption.API.decrypt(this.model.get('title')),
                content : App.Encryption.API.decrypt(this.model.get('content')),
            };

            view = new View({
                model     : this.model,
                decrypted : decrypted,
                tags      : this.tags,
                notebooks : this.notebooks
            });

            App.content.show(view);

            this.model.on('save', this.save, this);
            view.on('redirect', this.redirect, this);
            view.on('uploadImages', this.uploadImages, this);
            view.trigger('shown');
        },

        // Uploading images to indexDB
        uploadImages: function (imgs) {
            var self = this;
            $.when(this.files.uploadImages(imgs)).done(function (data) {
                self.model.trigger('attachImages', data);
            });
        },

        save: function (data) {
            var notebook;

            // Encryption
            data.title = App.Encryption.API.encrypt(_.escape(data.title));
            data.content = App.Encryption.API.encrypt(data.content);

            // New notebook
            notebook = this.model.get('notebookId');
            if (data.notebookId !== notebook) {
                notebook = this.notebooks.get(data.notebookId);
                data.notebookId = notebook.get('id');
            }
            console.log(data.tags);

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
