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

            this.showAllNotes();
        },

        /**
         * Show list of notes
         */
        showAllNotes: function () {
            var notes = this.collectionNotes.getActive();
            this.collectionNotes = new CollectionNotes(notes);

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
            App.sidebar.$el.find('.list-group-item.active').removeClass('active');
            App.sidebar.$el.find('#note-' + id).addClass('active');
            App.content.show(new NoteItem({
                model: this.collectionNotes.get(id)
            }));
        },

        // Add a new note
        noteAdd: function () {
            var content = new NoteAdd({
                collection: this.collectionNotes
            });
            this.showModal({
                content: content,
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
            var note, result, url = '', i, prev;
            note = this.collectionNotes.get(id);
            result = note.save({'trash': 1});

            if (result === false) {
                url = '/note/' + id;
            } else {
                i = this.collectionNotes.indexOf(note);
                prev = this.collectionNotes.at(i - 1);

                url = '/note/' + prev.get('id');
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
