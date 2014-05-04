/*global define*/
define([
    'underscore',
    'app',
    'marionette',
    'models/note',
    'collections/notebooks',
    'collections/files',
    'apps/notes/show/noteView'
], function (_, App, Marionette, NoteModel, NotebooksCollection, FilesCollection, NoteView) {
    'use strict';

    var Show = App.module('AppNote.Show');

    /**
     * Controller shows note's content in App.content
     */
    Show.Controller = Marionette.Controller.extend({
        initialize: function () {
            _.bindAll(this, 'showNote', 'showContent', 'fetchImages');
        },

        /**
         * Fetch note, then show it
         */
        showNote: function (args) {
            this.args = args || this.args;

            this.note = new NoteModel({ id : this.args.id });
            this.notebooks = new NotebooksCollection();
            this.files = new FilesCollection();

            // Switch to another database
            this.note.database.getDB(args.profile);
            this.notebooks.database.getDB(args.profile);
            this.files.database.getDB(args.profile);

            // Events
            this.note.on('updateTaskProgress', this.updateTaskProgress, this);
            this.note.on('change', this.triggerChangeToSidebar, this);

            $.when(this.note.fetch(), this.notebooks.fetch())
                .done(this.fetchImages);
        },

        fetchImages: function () {
            $.when(
                this.files.fetchImages(this.note.get('images'))
            ).done(this.showContent);
        },

        showContent: function () {
            var notebook = this.notebooks.get(this.note.get('notebookId')),
                decrypted,
                args;

            decrypted = {
                title   : App.Encryption.API.decrypt(this.note.get('title')),
                content : App.Encryption.API.decrypt(this.note.get('content')),
                notebook: null
            };

            if (notebook) {
                decrypted.notebook = notebook.get('name');
            }

            args = {
                model     : this.note,
                decrypted : decrypted,
                args      : this.args,
                files     : this.files
            };

            App.content.show(new NoteView(args));
        },

        triggerChangeToSidebar: function () {
            App.trigger('notes:changeModel', this.note.get('id'));
        },

        updateTaskProgress: function (text) {
            var content = App.Encryption.API.encrypt(text.content);
            this.note.trigger('update:any');

            this.note.save({
                content       : content,
                taskCompleted : text.completed
            });
        }

    });

    return Show.Controller;
});
