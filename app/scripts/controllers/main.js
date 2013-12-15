/*global define*/
// /*global prompt*/
/*global sjcl*/
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
    'tagForm',
    'helpView',
    'configsView',
    'sjcl'
],
function(_, Backbone, Marionette, App, CollectionNotes, CollectionNotebooks, CollectionTags, CollectionConfigs, NoteForm, NoteItem, NoteSidebar, NotebookLayout, NotebookSidebar, NotebookForm, TagsSidebar, TagForm, HelpView, ConfigsView) {
    'use strict';

    var Controller = Marionette.Controller.extend({

        /**
         * Initialization
         */
        initialize: function() {
            // Fetch notes
            this.Notes = new CollectionNotes();
            this.Notes.fetch({reset: true});

            // Fetch notebooks
            this.Notebooks = new CollectionNotebooks();
            this.Notebooks.fetch({reset: true});

            // Fetch tags
            this.Tags = new CollectionTags();
            this.Tags.fetch({reset: true});

            // Fetch configs
            this.Configs = new CollectionConfigs();
            this.Configs.fetch({reset: true});

            // Set default set of configs
            if (this.Configs.length === 0) {
                this.Configs.firstStart();
            }

            // Ask password
            if (this.Configs.get('encrypt').get('value') === 1) {
                this.auth();
            }

            this.on('notes.shown', this.showAllNotes);
        },

        /**
         * Authorization
         */
        auth: function () {
            // var password = prompt('Please enter your password'),
            var password = '1',
                pwd = this.Configs.get('encryptPass').get('value');

            if (pwd.toString() === sjcl.hash.sha256.hash(password).toString()) {
                this.secureKey = sjcl.misc.pbkdf2(
                    password,
                    this.Configs.get('encryptSalt').toString(),
                    1000
                );
            } else {
                this.auth();
            }
        },

        /**
         * Show list of notes in sidebar
         */
        showAllNotes: function (args) {
            var notes = this.Notes.clone(),
                arg = _.extend({
                    filter  : 'active',
                    title   : 'Inbox',
                    configs : this.Configs,
                    key     : this.secureKey
                }, args),
                notebookMod;

            arg.notebookId = (isNaN(arg.notebookId)) ? 0 : arg.notebookId;
            arg.tagId = (isNaN(arg.tagId)) ? 0 : arg.tagId;
            arg.lastPage = (isNaN(arg.lastPage)) ? 1 : arg.lastPage;
            arg.collection = notes;

            if (arg.notebookId !== 0) {
                notebookMod = this.Notebooks.get(arg.notebookId);
                arg.title = notebookMod.get('name');
            }

            App.sidebar.show(new NoteSidebar(arg));
        },

        /**
         * Index page
         */
        index: function (notebook, page) {
            App.content.reset();
            this.trigger('notes.shown', {
                notebookId : Math.floor(notebook),
                key        : this.secureKey,
                lastPage   : page
            });
        },

        /* ------------------------------
         * Notes actions
         * ------------------------------ */
        // Show notes content
        showNoteContent: function (id) {
            if (id !== undefined) {
                App.content.show(new NoteItem({
                    model      : this.Notes.get(id),
                    collection : this.Notes,
                    configs    : this.Configs
                }));
            } else {
                App.content.reset();
            }
        },

        /**
         * Search specific note
         */
        noteSearch: function (query, page, id) {
            this.trigger('notes.shown', {
                filter      : 'search',
                searchQuery : query,
                title       : 'Search',
                lastPage    : page
            });

            this.showNoteContent(id);
        },

        /**
         * Show favorite notes
         */
        noteFavorite: function (page, id) {
            this.trigger('notes.shown', {
                filter   : 'favorite',
                title    : 'Favorite notes',
                lastPage : page
            });

            this.showNoteContent(id);
        },

        /**
         * Show notes which is deleted
         */
        noteTrashed: function (page, id) {
            this.trigger('notes.shown', {
                filter   : 'trashed',
                title    : 'Removed notes',
                lastPage : page
            });

            this.showNoteContent(id);
        },

        /**
         * Show list of notes which has been tagged with :tag
         */
        noteTag: function (tag, page, id) {
            var tagModel = this.Tags.get(tag);
            this.trigger('notes.shown', {
                filter   : 'tagged',
                tagId    : tag,
                title    : 'Tag: ' + tagModel.get('name'),
                lastPage : page
            });

            this.showNoteContent(id);
        },

        /**
         * Show note's content
         */
        noteShow: function (notebook, page, id) {
            if (id === undefined) {
                id = notebook;
                notebook = 0;
            }

            // Show sidebar
            this.trigger('notes.shown', {
                filter     : 'active',
                lastPage   : page,
                notebookId : Math.floor(notebook)
            });

            // Show content
            App.content.show(new NoteItem({
                model      : this.Notes.get(id),
                collection : this.Notes,
                configs    : this.Configs,
                key        : this.secureKey
            }));
        },

        /**
         * Add a new note
         */
        noteAdd: function () {
            // Show sidebar
            this.trigger('notes.shown');

            // Form
            var content = new NoteForm({
                collection     : this.Notes,
                notebooks      : this.Notebooks,
                collectionTags : this.Tags,
                configs        : this.Configs,
                key            : this.secureKey
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

            // Show Sidebar
            this.trigger('notes.shown');

            note = this.Notes.get(id);
            content = new NoteForm({
                collection     : this.Notes,
                notebooks      : this.Notebooks,
                collectionTags : this.Tags,
                model          : note,
                configs        : this.Configs,
                key            : this.secureKey
            });

            App.content.show(content);
            document.title = 'Editing note: ' + note.get('title');
            content.trigger('shown');
        },

        /**
         * Remove Note
         */
        noteRemove: function (id) {
            var note, result, i, prev, url;

            url = '/note/' + this.notebookId + '/p' + this.pageN;
            note = this.Notes.get(id);

            if (note.get('trash') === 0) {
                result = note.save({'trash': 1});

                if (result === false) {
                    url += id;
                } else if (this.Notes.length > 1) {
                    i = this.Notes.indexOf(note);
                    i = (i === 0) ? i : i - 1;

                    // this.Notes.remove(note);
                    prev = this.Notes.at(i);

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
                collection : this.Notebooks,
                configs            : this.Configs,
                key                : this.secureKey
            });

            // Tags list
            tags = new TagsSidebar({
                collection : this.Tags
            });

            // Show sidebar layout
            sidebar = new NotebookLayout({
                collectionNotebooks: this.Notebooks,
                collectionTags     : this.Tags,
                configs            : this.Configs
            });
            App.sidebar.show(sidebar);

            // Notebooks & tags list in sidebar
            sidebar.notebooks.show(notebook);
            sidebar.tags.show(tags);

            App.content.reset();
        },

        /**
         * Add new notebook
         */
        notebookAdd: function () {
            var content = new NotebookForm({
                collection: this.Notebooks,
                configs: this.Configs,
                key: this.secureKey
            });

            App.modal.show(content);
        },

        /**
         * Edit existing notebook
         */
        notebookEdit: function (id) {
            var notebook = this.Notebooks.get(id),
                content = new NotebookForm({
                    model: notebook,
                    collection: this.Notebooks,
                    configs: this.Configs,
                    key: this.secureKey
                });

            App.modal.show(content);
        },

        /**
         * Remove notebook
         */
        notebookRemove: function (id) {
            var n = this.Notebooks.get(id);
            n.destroy();
            Backbone.history.navigate('#/notebooks', true);
        },

        /* ---------------------------------
         * Tags actions
         * --------------------------------- */
        tagAdd: function() {
            var content = new TagForm({
                collection: this.Tags
            });

            App.modal.show(content);
        },

        /**
         * Edit existing tag
         */
        tagEdit: function(id) {
            var content = new TagForm({
                collection: this.Tags,
                model: this.Tags.get(id)
            });
            App.modal.show(content);
        },

        /**
         * Remove tag
         */
        tagRemove: function (id) {
            var model = this.Tags.get(id);
            model.destroy();
            Backbone.history.navigate('#/notebooks', true);
        },

        /**
         * Help View Shortcuts
         */
        help: function () {
            App.modal.show(new HelpView({
                collection: this.Configs
            }));
        },

        /**
         * Settings page
         */
        settings: function () {
            App.modal.show(new ConfigsView({
                collection: this.Configs
            }));
        }

    });

    return Controller;
});
