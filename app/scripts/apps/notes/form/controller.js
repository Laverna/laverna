/* global define */
define([
    'underscore',
    'jquery',
    'app',
    'marionette',
    'helpers/uri',
    'collections/notes',
    'collections/tags',
    'collections/notebooks',
    'collections/files',
    'models/note',
    'apps/notes/form/formView',
    'checklist',
    'tags'
], function (_, $, App, Marionette, URI, NotesCollection, TagsCollection, NotebooksCollection, FilesCollection, NoteModel, View, Checklist, Tags) {
    'use strict';

    var Form = App.module('AppNote.Form');

    Form.Controller = Marionette.Controller.extend({
        initialize: function () {
            _.bindAll(this, 'addForm', 'editForm', 'show', 'fetchImages', 'redirect', 'confirmRedirect');

            this.tags = new TagsCollection();
            this.notebooks = new NotebooksCollection();
            this.files = new FilesCollection();
        },

        switchDatabase: function (db) {
            this.model.database.getDB(db);
            this.tags.database.getDB(db);
            this.notebooks.database.getDB(db);
            this.files.database.getDB(db);
        },

        /**
         * Add a new note
         */
        addForm: function (args) {
            this.model = new NoteModel();
            this.switchDatabase(args.profile);

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
            this.switchDatabase(args.profile);

            $.when(
                this.tags.fetch({ limit : 100 }),
                this.notebooks.fetch(),
                this.model.fetch()
            ).done(this.fetchImages);
        },

        fetchImages: function () {
            $.when(
                this.files.fetchImages(this.model.get('images'))
            ).done(this.show);
        },

        show: function () {
            var decrypted = this.model.decrypt();

            this.view = new View({
                model     : this.model,
                profile   : this.model.database.id,
                decrypted : decrypted,
                tags      : this.tags,
                notebooks : this.notebooks,
                files     : this.files
            });

            App.content.show(this.view);

            this.model.on('save', this.save, this);

            this.view.on('redirect', this.redirect, this);
            this.view.on('uploadImages', this.uploadImages, this);
            this.view.trigger('shown');
        },

        // Uploading images to indexDB
        uploadImages: function (imgs) {
            var self = this;
            $.when(this.files.uploadImages(imgs.images)).done(function (data) {
                self.model.trigger('attachImages', {
                    images: data,
                    callback: imgs.callback
                });
            });
        },

        save: function (data) {
            var self = this,
                checklist,
                notebook;

            // Get new data
            data.title = this.view.ui.title.val().trim();
            data.notebookId = this.view.ui.notebookId.val().trim();

            if (data.title === '') {
                data.title = $.t('Unnamed');
            }

            // New notebook
            notebook = this.model.get('notebookId');
            if (data.notebookId !== notebook) {
                notebook = this.notebooks.get(data.notebookId);
                data.notebookId = (notebook) ? notebook.get('id') : 0;
            }

            // Images
            data.images = [];
            this.view.options.files.forEach(function (img) {
                data.images.push(img.get('id'));
            });

            // Tasks
            checklist = new Checklist().count(data.content);
            data.taskAll = checklist.all;
            data.taskCompleted = checklist.completed;

            // Tags
            data.tags = $.merge(new Tags().getTags(data.content), new Tags().getTags(data.title));

            // Encryption
            this.model.set(data).encrypt();

            // Save
            this.model.trigger('update:any');

            $.when(
                // Save changes
                this.model.save(),
                // Add new tags
                this.tags.saveAdd(data.tags)
            ).done(function () {
                self.redirect(data.redirect);
            });
        },

        confirmRedirect: function (args) {
            var self = this;
            if (args.isUnchanged === true) {
                this.redirect(args.mayRedirect);
            } else {
                App.Confirm.show({
                    content : $.t('Are you sure? You have unsaved changes'),
                    success : function () {
                        self.redirect(args.mayRedirect);
                    }
                });
            }
        },

        redirect: function (showNote) {
            var url = '/notes';
            if (typeof showNote === 'object') {
                return this.confirmRedirect(showNote);
            }

            App.trigger('notes:added', this.model);

            // Redirect to edit page
            if (showNote === false) {
                url += '/edit/' + this.model.get('id');
                App.navigate(URI.link(url), {trigger: true});
            }
            // Redirect to list
            else if (typeof this.model.get('id') !== 'undefined') {
                App.AppNote.trigger('navigate:back');
            }

            if (showNote !== false) {
                App.content.reset();
            }
        }

    });

    return Form.Controller;
});
