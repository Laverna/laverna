/*global define*/
define([
    'underscore',
    'backbone',
    'marionette',
    'app',
    // collections
    'collections/notes',
    'collections/notebooks',
    'collections/tags',
    'collections/configs',
    // Views
    'noteForm',
    'noteItem',
    'noteSidebar',
    'notebookLayout',
    'notebookSidebar',
    'notebookForm',
    'tagsSidebar',
    'tagForm'
],
function(_, Backbone, Marionette, App, CollectionNotes, CollectionNotebooks, CollectionTags, CollectionConfigs, NoteForm, NoteItem, NoteSidebar, NotebookLayout, NotebookSidebar, NotebookForm, TagsSidebar, TagForm) {
    'use strict';

    var Controller = Marionette.Controller.extend({
        /**
         * Initialization
         */
        initialize: function() {
            // Fetch notes
            this.collectionNotes = new CollectionNotes();
            this.collectionNotes.fetch({reset: true});

            // Fetch notebooks
            this.collectionNotebooks = new CollectionNotebooks();
            this.collectionNotebooks.fetch({reset: true});

            // Fetch tags
            this.collectionTags = new CollectionTags();
            this.collectionTags.fetch({reset: true});

            // Fetch configs
            this.collectionConfigs = new CollectionConfigs();
            this.collectionConfigs.fetch({reset: true});

            // Set default set of configs
            if (this.collectionConfigs.length === 0) {
                this.collectionConfigs.firstStart();
            }

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
                notebookId : this.notebookId,
                notebook   : this.collectionNotebooks.get(this.notebookId),
                searchQuery: this.searchQuery,
                filter     : this.notesFilter
            }));
        },

        /**
         * Index page
         */
        index: function (notebook, page) {
            this.notesFilter = 'active';
            this.noteInit(notebook, page);
            App.content.reset();
        },

        /* ------------------------------
         * Notes actions
         * ------------------------------ */
        noteInit: function (notebook, page, id) {
            notebook = (notebook === undefined) ? 0 : notebook;
            this.notebookId = Math.floor(notebook);
            this.pageN = (isNaN(page)) ? 1 : page;
            this.SidebarView = NoteSidebar;

            // Default filter
            if (this.notesFilter === undefined) {
                this.notesFilter = 'active';
            }

            this.trigger('notes.shown');

            if (id !== undefined) {
                App.content.show(new NoteItem({
                    model: this.collectionNotes.get(id),
                    collection: this.collectionNotes,
                    app: App
                }));
            } else {
                App.content.reset();
            }
        },

        /**
         * Show notes
         */
        noteNotebook: function (notebook, page, id) {
            var title = 'Inbox';
            notebook = Math.floor(notebook);

            if (id === undefined) {
                id = notebook;
                notebook = 0;
            }

            if (notebook !== 0) {
                var notebookModel = this.collectionNotebooks.get(notebook);
                if (notebookModel !== undefined) {
                    title = notebookModel.get('name');
                }
            }
        },

        // Search specific note
        noteSearch: function (query, page, id) {
            this.notesFilter = 'search';
            this.searchQuery = query;
            this.noteInit(0, page, id);
        },

        // Show favorite notes
        noteFavorite: function (page, id) {
            this.notesFilter = 'favorite';
            this.noteInit(0, page, id);
        },

        // Show notes which is deleted
        noteTrashed: function (page, id) {
            this.notesFilter = 'trashed';
            this.noteInit(0, page, id);
        },

        // Show note's content
        noteTag: function (tag, page, id) {
            this.notesFilter = 'tagged';
            this.noteInit(tag, page, id);
        },

        // Show note's content
        noteShow: function (notebook, page, id) {
            this.notesFilter = 'active';

            if (id !== undefined) {
                this.noteInit(notebook, page);
            } else {
                id = notebook;
                this.noteInit(0, page);
            }

            App.content.show(new NoteItem({
                model: this.collectionNotes.get(id),
                collection: this.collectionNotes,
                configs: this.collectionConfigs
            }));
        },

        // Add a new note
        noteAdd: function () {
            this.noteInit();
            var content = new NoteForm({
                collection: this.collectionNotes,
                notebooks : this.collectionNotebooks,
                collectionTags: this.collectionTags
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
                notebooks : this.collectionNotebooks,
                collectionTags: this.collectionTags,
                model      : note
            });

            App.content.show(content);
            document.title = 'Editing note: ' + note.get('title');
            content.trigger('shown');
        },

        // Remove Note
        noteRemove: function (id) {
            var note, result, i, prev;
            var url = '/note/' + this.notebookId + '/p' + this.pageN;
            note = this.collectionNotes.get(id);

            if (note.get('trash') === 0) {
                result = note.save({'trash': 1});

                if (result === false) {
                    url += id;
                } else if (this.collectionNotes.length > 1) {
                    i = this.collectionNotes.indexOf(note);
                    i = (i === 0) ? i : i - 1;

                    // this.collectionNotes.remove(note);
                    prev = this.collectionNotes.at(i);

                    url += prev.get('id');
                } else {
                    url = '';
                }
            } else {
                note.destroy();
                url = '/note/trashed/p' + this.pageN;
            }

            Backbone.history.navigate(url, true);
        },

        /* ------------------------------
         * Notebooks actions
         * ------------------------------ */
        notebooks: function () {
            var tags, notebook, sidebar;

            // Notebooks list
            notebook = new NotebookSidebar({
                collection : this.collectionNotebooks
            });

            // Tags list
            tags = new TagsSidebar({
                collection : this.collectionTags
            });

            // Show sidebar layout
            sidebar = new NotebookLayout({
                collectionNotebooks: this.collectionNotebooks,
                collectionTags     : this.collectionTags
            });
            App.sidebar.show(sidebar);

            // Notebooks & tags list in sidebar
            sidebar.notebooks.show(notebook);
            sidebar.tags.show(tags);

            App.content.reset();
        },

        // Add new notebook
        notebookAdd: function () {
            var content = new NotebookForm({
                collection: this.collectionNotebooks
            });

            App.modal.show(content);
        },

        // Edit existing notebook
        notebookEdit: function (id) {
            var notebook = this.collectionNotebooks.get(id),
                content = new NotebookForm({
                    model: notebook,
                    collection: this.collectionNotebooks
                });

            App.modal.show(content);
        },

        // Remove notebook
        notebookRemove: function (id) {
            var n = this.collectionNotebooks.get(id);
            n.destroy();
            Backbone.history.navigate('#/notebooks', true);
        },

        /* ---------------------------------
         * Tags actions
         * --------------------------------- */
        tagAdd: function() {
            var content = new TagForm({
                collection: this.collectionTags
            });

            App.modal.show(content);
        },

        tagEdit: function(id) {
            var content = new TagForm({
                collection: this.collectionTags,
                model: this.collectionTags.get(id)
            });
            App.modal.show(content);
        },

        tagRemove: function (id) {
            var model = this.collectionTags.get(id);
            model.destroy();
            Backbone.history.navigate('#/notebooks', true);
        }

    });

    return Controller;
});
