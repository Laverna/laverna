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
    'noteSidebar',
    'text!modalTempl'
],
function(_, Backbone, Marionette, Modal, App, CollectionNotes, NoteAdd, NoteItem, NoteEdit, NoteSidebar, ModalTempl) {
    'use strict';

    var Controller = Marionette.Controller.extend({
        /**
         * Initialization
         */
        initialize: function() {
            this.collectionNotes = new CollectionNotes();
            this.collectionNotes.fetch({
                reset: true
            });

            App.sidebar.show(new NoteSidebar({
                collection: this.collectionNotes
            }));
        },

        /**
         * Shows bootstrap modal window
         */
        showModal: function (options) {
            var opt = _.extend({
                template: _.template(ModalTempl),
                okText: 'Create',
                allowCancel: true,
                modalOptions: {
                    backdrop: 'static'
                }
            }, options);

            var modal = new Backbone.BootstrapModal(opt).open();

            $(window).bind('hashchange', function () {
                modal.close();
            });

            return modal;
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
            App.sidebar.$el.find('#note-' + id).addClass('active');
            App.content.show(new NoteItem({
                model: this.collectionNotes.get(id)
            }));
        },

        // Add a new note
        noteAdd: function () {
            this.showModal({
                content: new NoteAdd({
                    collection: this.collectionNotes
                }),
                okText: 'Create',
                escape: false
            });
        },

        // Edit an existing note
        noteEdit: function (id) {
            var note = this.collectionNotes.get(id);
            var content = new NoteEdit({
                collection : this.collectionNotes,
                model      : note
            });

            // Show content in modal window
            this.showModal({
                content: content,
                okText: 'Save',
            });
        },

        // Remove Note
        noteRemove: function (id) {
            var note, result, url = '';
            note = this.collectionNotes.get(id);
            result = note.save({'trash': 1});

            if (result === false) {
                url = '/note/' + id;
            }

            Backbone.history.navigate(url, true);
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
