/*global define*/
define([
    'underscore',
    'backbone',
    'marionette',
    'bootstrap-modal',
    'app',
    // collections
    'collections/notes',
    // Views
    'noteAdd',
    'noteItem',
    'noteEdit',
    'text!modalTempl'
],
function(_, Backbone, Marionette, Modal, App, CollectionNotes, NoteAdd, NoteItem, NoteEdit, ModalTempl) {
// function(_, Backbone, Marionette, Modal, App, CollectionNotes, NoteAdd, NoteItem, NoteEdit, ModalTempl) {
    'use strict';

    var Controller = Marionette.Controller.extend({
        /**
         * Initialization
         */
        initialize: function() {
            this.collectionNotes = new CollectionNotes();
            this.collectionNotes.fetch({reset: true});
        },

        /**
         * Index page
         */
        index: function () {
            console.log('index page');
        },

        /* ------------------------------
         * Notes actions
         * ------------------------------ */
        note: function (id) {
            App.content.show(new NoteItem({
                model: this.collectionNotes.get(id)
            }));
        },

        noteAdd: function () {
            new Backbone.BootstrapModal({
                template: _.template(ModalTempl),
                content: new NoteAdd({
                    collection: this.collectionNotes,
                }),
                okText: 'Create',
            }).open();
        },

        // Edit an existing note
        noteEdit: function (id) {
            var note = this.collectionNotes.get(id);
            var content = new NoteEdit({
                collection : this.collectionNotes,
                model      : note
            });

            // Show content in modal window
            new Backbone.BootstrapModal({
                template: _.template(ModalTempl),
                content: content,
                okText: 'Save',
                modalOptions: {
                    backdrop: 'static'
                }
            }).open();
        },

        // Remove Note
        noteRemove: function (id) {
            var note = this.collectionNotes.get(id);
            var result = note.save({'trash': 1});

            if (result !== false) {
                Backbone.history.navigate('', true);
            }
        },

        /* ------------------------------
         * Notebooks actions
         * ------------------------------ */
        notebook: function () {
        },

        notebookAdd: function () {
        },

        notebookEdit: function () {
        },

        notebookRemove: function () {
        }

    });

    return Controller;
});
