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
    // Views
    'noteForm',
    'noteItem',
    'noteSidebar',
    'notebookLayout',
    'notebookSidebar',
    'notebookForm',
    'tagsSidebar',
    'tagForm',
],
function(_, Backbone, Marionette, App, CollectionNotes, CollectionNotebooks, CollectionTags, NoteForm, NoteItem, NoteSidebar, NotebookLayout, NotebookSidebar, NotebookForm, TagsSidebar, TagForm) {
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
        },

        /**
         * Show list of notes
         */
        showAllNotes: function (args) {
            var notes = this.collectionNotes.clone();

            args = _.extend(args, {
                collection: notes
            });

            if (args.notebookId !== undefined) {
                args.notebook = this.collectionNotebooks.get(args.notebookId);
            } else {
                args.notebookId = 0;
            }

            App.sidebar.show(new NoteSidebar(args));
        },

        /* ------------------------------
         * Notes actions
         * ------------------------------ */

        // Index page
        index: function (notebook, page) {
            this.noteNotebook(notebook, page, 0);
        },

        /**
         * Show notes content
         */
        showNote: function (id) {
            if (id !== undefined && id !== 0) {
                App.content.show(new NoteItem({
                    model: this.collectionNotes.get(id),
                    collection: this.collectionNotes
                }));
            } else {
                App.content.reset();
            }
        },

        /**
         * Show notes
         */
        noteNotebook: function (notebook, page, id) {
            if (id === undefined) {
                id = notebook;
                notebook = 0;
            }

            // Show notes list in sidebar
            this.showAllNotes({
                filter     : 'active',
                page       : page,
                notebookId : notebook
            });

            // Show note
            this.showNote(id);
        },

        /**
         * Search page
         */
        noteSearch: function (query, page, id) {
            this.showAllNotes({
                filter     : 'search',
                searchQuery: query,
                page       : page
            });

            this.showNote(id);
        },

        /**
         * Show only favorite notes
         */
        noteFavorite: function (page, id) {
            this.showAllNotes({
                filter     : 'favorite',
                page       : page
            });

            this.showNote(id);
        },

        /**
         * Show notes which is deleted
         */
        noteTrashed: function (page, id) {
            this.showAllNotes({
                filter     : 'trashed',
                page       : page
            });

            this.showNote(id);
        },

        /**
         * Show notes which is tagged with :tag
         */
        noteTag: function (tag, page, id) {
            this.showAllNotes({
                filter     : 'tagged',
                tagId      : tag,
                page       : page
            });

            this.showNote(id);
        },

        /**
         * Add a new note
         */
        noteAdd: function () {
            this.showAllNotes({filter : 'active', page : 0});

            var content = new NoteForm({
                collection: this.collectionNotes,
                notebooks : this.collectionNotebooks,
                collectionTags: this.collectionTags
            });

            App.content.show(content);
            document.title = 'Creating new note';
            content.trigger('shown');
        },

        /**
         * Edit an existing note
         */
        noteEdit: function (id) {
            var note, content;

            // Show notes list in sidebar
            this.showAllNotes({filter : 'active', page : 0});

            // Edit form
            note = this.collectionNotes.get(id);
            content = new NoteForm({
                collection : this.collectionNotes,
                notebooks : this.collectionNotebooks,
                collectionTags: this.collectionTags,
                model      : note
            });

            App.content.show(content);
            document.title = 'Editing note: ' + note.get('title');
            content.trigger('shown');
        },

        /**
         * Remove Note
         */
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
            document.title = 'List of notebooks and tags';
        },

        /**
         * Add new notebook
         */
        notebookAdd: function () {
            var content = new NotebookForm({
                collection: this.collectionNotebooks
            });

            App.modal.show(content);
        },

        /**
         * Edit existing notebook
         */
        notebookEdit: function (id) {
            var notebook = this.collectionNotebooks.get(id),
                content = new NotebookForm({
                    model: notebook,
                    collection: this.collectionNotebooks
                });

            App.modal.show(content);
        },

        /**
         * Remove notebook
         */
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

        /**
         * Edit tag
         */
        tagEdit: function(id) {
            var content = new TagForm({
                collection: this.collectionTags,
                model: this.collectionTags.get(id)
            });
            App.modal.show(content);
        },

        /**
         * Remove tag
         */
        tagRemove: function (id) {
            var model = this.collectionTags.get(id);
            model.destroy();
            Backbone.history.navigate('#/notebooks', true);
        }

    });

    return Controller;
});
