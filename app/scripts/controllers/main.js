/*global define*/
define([
    'backbone',
    'marionette',
    'bootstrap-modal',
    // collections
    'collections/notes',
    // Views
    'views/noteAdd'
], function(Backbone, Marionette, Modal, CollectionNotes, noteAdd) {
    'use strict';

    var Controller = Marionette.Controller.extend({
        /**
         * Initialization
         */
        initialize: function(){
            this.collectionNotes = new CollectionNotes();
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
            console.log('note page' + id);
        },

        noteAdd: function () {
            new Backbone.BootstrapModal({
                content: new noteAdd({
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
