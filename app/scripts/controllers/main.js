/*global define*/
define([
    'backbone',
    'marionette',
    'bootstrap-modal',
    'app',
    // collections
    'collections/notes',
    // Views
    'views/item/noteAdd',
    'views/item/noteItem'
], function(Backbone, Marionette, Modal, App, CollectionNotes, NoteAdd, NoteItem) {
    'use strict';

    var Controller = Marionette.Controller.extend({
        /**
         * Initialization
         */
        initialize: function(){
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
                content: new NoteAdd({
                    collection: this.collectionNotes,
                }),
                okText: 'Create',
            }).open();
        },

        noteEdit: function () {
        },

        noteRemove: function () {
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
