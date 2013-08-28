/*global define*/
define([
    'backbone',
    'marionette',
    'bootstrap-modal',
    'app',
    // collections
    'collections/notes',
    // Views
    'views/noteAdd',
    'views/noteItem'
], function(Backbone, Marionette, Modal, App, CollectionNotes, NoteAdd, NoteItem) {
    'use strict';

    var Controller = Marionette.Controller.extend({
        /**
         * Initialization
         */
        initialize: function(){
            this.collectionNotes = new CollectionNotes();
            this.collectionNotes.fetch();
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
            console.log(this.collectionNotes.get(id));
            App.content.show(new NoteItem({
                model: this.collectionNotes.get(id),
            }));
            console.log('note page' + id);
        },

        noteAdd: function () {
            new Backbone.BootstrapModal({
                content: new NoteAdd({
                    collection: this.collectionNotes,
                }),
                okText: 'Create',
            }).open();
        },

        noteEdit: function () {
        },

        // Remove Note
        noteRemove: function (id) {
            var note = this.collectionNotes.get(id);
            console.log(note);
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
