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
    'noteForm',
    'noteItem',
    'noteSidebar',
    'text!modalTempl'
],
function(_, Backbone, Marionette, Modal, App, CollectionNotes, NoteForm, NoteItem, NoteSidebar, ModalTempl) {
    'use strict';

    var Controller = Marionette.Controller.extend({
        /**
         * Initialization
         */
        initialize: function() {
            this.collectionNotes = new CollectionNotes();
            this.collectionNotes.fetch({reset: true});

            this.on('notes.shown', this.showAllNotes);
        },

        /**
         * Show list of notes
         */
        showAllNotes: function () {
            var notes = this.collectionNotes.clone();

            App.sidebar.show(new NoteSidebar({
                collection : notes,
                lastPage   : this.pageN,
                parentId   : this.parentId,
                notebookId : this.notebookId,
                searchQuery: this.searchQuery,
                filter     : this.notesFilter
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
                animate: true,
                modalOptions: {
                    backdrop: 'static',
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
        index: function (notebook, page) {
            this.notesFilter = 'active';
            this.noteInit(notebook, page);
            console.log('index page');
        },

        /* ------------------------------
         * Notes actions
         * ------------------------------ */
        noteInit: function (notebook, page) {
            notebook = (notebook === undefined) ? 0 : notebook;
            this.notebookId = notebook;
            this.pageN = (isNaN(page)) ? 1 : page;
            this.SidebarView = NoteSidebar;

            // Default filter
            if (this.notesFilter === undefined) {
                this.notesFilter = 'active';
            }

            this.trigger('notes.shown');
        },

        // Search specific note
        noteSearch: function (query, page, id) {
            this.notesFilter = 'search';
            this.searchQuery = query;
            this.noteInit(0, page, id);

            if (id !== undefined) {
                App.content.show(new NoteItem({
                    model: this.collectionNotes.get(id),
                    collection: this.collectionNotes
                }));
            }
        },

        // Show favorite notes
        noteFavorite: function (page, id) {
            this.notesFilter = 'favorite';
            this.noteInit(0, page, id);

            if (id !== undefined) {
                console.log('noteItem favorite');
                App.content.show(new NoteItem({
                    model: this.collectionNotes.get(id),
                    collection: this.collectionNotes
                }));
            }
        },

        // Show notes which is deleted
        noteTrashed: function (page, id) {
            this.notesFilter = 'trashed';
            this.noteInit(0, page, id);

            if (id !== undefined) {
                App.content.show(new NoteItem({
                    model: this.collectionNotes.get(id),
                    collection: this.collectionNotes
                }));
            }
        },

        // Show note's content
        noteShow: function (notebook, page, id) {
            this.notesFilter = 'active';

            if (id !== undefined) {
                this.noteInit(notebook, page, id);
            } else {
                id = notebook;
                this.noteInit(notebook, page, id);
            }

            // App.sidebar.$el.find('.list-group-item.active').removeClass('active');
            // App.sidebar.$el.find('#note-' + id).addClass('active');

            App.content.show(new NoteItem({
                model: this.collectionNotes.get(id),
                collection: this.collectionNotes
            }));
        },

        // Add a new note
        noteAdd: function () {
            this.noteInit();
            var content = new NoteForm({
                collection: this.collectionNotes
            });

            App.content.show(content);
            document.title = 'Creating new note';
            content.trigger('shown');
        },

        // Edit an existing note
        noteEdit: function (id) {
            this.noteInit();

            var note = this.collectionNotes.get(id);
            var content = new NoteForm({
                collection : this.collectionNotes,
                model      : note
            });

            App.content.show(content);
            document.title = 'Editing note: ' + note.get('title');
            content.trigger('shown');
        },

        // Remove Note
        noteRemove: function (id) {
            var note, result, i, prev;
            var url = '/note/' + this.notebookId + '/p' + this.pageN + '/show/';
            note = this.collectionNotes.get(id);

            result = note.save({'trash': 1});

            if (result === false) {
                url += id;
            } else if (this.collectionNotes.length > 1) {
                i = this.collectionNotes.indexOf(note);
                i = (i === 0) ? i : i - 1;

                this.collectionNotes.remove(note);
                prev = this.collectionNotes.at(i);

                url += prev.get('id');
            } else {
                url = '';
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
