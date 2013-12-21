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

            // Fetch notes
            this.Notes = new CollectionNotes();
            // this.Notes.setEncryptionData({configs: this.Configs, key: this.secureKey});

            // Fetch notebooks
            this.Notebooks = new CollectionNotebooks();
            // this.Notebooks.setEncryptionData({configs: this.Configs, key: this.secureKey});
            this.Notebooks.fetch({reset: true});

            // Fetch tags
            this.Tags = new CollectionTags();
            this.Tags.fetch({reset: true});

            // Show all notes
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
            var that = this,
                model;

            if (this.Notes.length === 0) {
                model = new this.Notes.model({id : id});
                model.fetch({
                    success: function () {
                        that.showNote(model);
                    },
                    error: function () {
                        App.content.reset();
                    }
                });
            } else {
                model = this.Notes.get(id);
                this.showNote(model);
            }
        },

        /**
         * Show content
         */
        showNote: function (note) {
            var content = {
                    model      : note,
                    collection : this.Notes,
                    configs    : this.Configs
                };

            App.content.show(new NoteItem(content));
        },

        /**
         * Fetch notes from DB
         */
        showAllNotes: function (args) {
            var that = this;

            if (this.Notes.length === 0) {
                this.Notes.fetch({
                    success: function () {
                        that.showSidebarNotes(args);
                    }
                });
            } else {
                that.showSidebarNotes(args);
            }
        },

        /**
         * Show list of notes in sidebar
         */
        showSidebarNotes: function (args) {
            var notes = this.Notes.clone(),
                arg = _.extend({
                    filter     : 'active',
                    title      : 'Inbox',
                    configs    : this.Configs,
                    key        : this.secureKey,
                    collection : notes
                }, args),
                notebookMod;

            arg.notebookId = (isNaN(arg.notebookId)) ? 0 : arg.notebookId;
            arg.tagId = (isNaN(arg.tagId)) ? 0 : arg.tagId;
            arg.lastPage = (isNaN(arg.lastPage)) ? 1 : arg.lastPage;

            if (arg.notebookId !== 0) {
                notebookMod = this.Notebooks.get(arg.notebookId);
                arg.title = notebookMod.get('name');
            }

            // Show sidebar
            App.sidebar.show(new NoteSidebar(arg));
        },

        /**
         * Search specific note
         */
        noteSearch: function (query, page, id) {
            this.trigger('notes.shown', {
                filter      : 'search',
                searchQuery : query,
                activeNote : id,
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
                activeNote : id,
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
                activeNote : id,
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
                activeNote : id,
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
                activeNote : id,
                notebookId : Math.floor(notebook)
            });

            // Show content
            this.showNoteContent(id);
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
            // Show Sidebar
            this.trigger('notes.shown');

            var note = new this.Notes.model({id: id}),
                content = {
                    collection     : this.Notes,
                    notebooks      : this.Notebooks,
                    collectionTags : this.Tags,
                    model          : note,
                    configs        : this.Configs,
                    key            : this.secureKey
                };

            note.fetch({
                success: function () {
                    content = new NoteForm(content);
                    App.content.show(content);
                    content.trigger('shown');
                }
            });

            document.title = 'Editing note: ' + note.get('title');
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
