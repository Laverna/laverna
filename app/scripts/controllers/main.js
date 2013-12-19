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

            // Formating configs to JSON
            this.configs = this.Configs.getConfigs();

            // Ask password
            if (this.Configs.get('encrypt').get('value') === 1) {
                this.auth();
            }

            // Fetch notes
            this.Notes = new CollectionNotes();

            // Fetch notebooks
            this.Notebooks = new CollectionNotebooks();
            this.Notebooks.fetch({reset: true});

            // Fetch tags
            this.Tags = new CollectionTags();
            this.Tags.fetch({reset: true});

            // Show all notes in sidebar
            this.on('note:show', this._showNote);
        },

        /**
         * Authorization
         */
        auth: function () {
            // var password = prompt('Please enter your password'),
            var password = '1',
                pwd = this.configs.encryptPass;

            if (pwd.toString() === sjcl.hash.sha256.hash(password).toString()) {
                this.configs.secureKey = sjcl.misc.pbkdf2(
                    password,
                    this.configs.encryptSalt.toString(),
                    1000
                );
            } else {
                this.auth();
            }
        },

        /* ------------------------------
         * Notes actions
         * ------------------------------ */
        // Index page
        index: function (notebook, page) {
            var self = this;

            // Show sidebar
            this.Notes.fetch({
                conditions : {trash: 0},
                limit   : this.configs.pagination,
                offset  : (page === 1) ? 0 : page,
                success : function () {
                    // Show sidebar
                    App.sidebar.show(new NoteSidebar({
                        page       : (page === undefined) ? 0 : page,
                        collection : self.Notes,
                        configs    : self.configs,
                        url        : '/note/' + notebook
                    }));
                }
            });

            // Reset content
            // App.content.reset();
        },


        /**
         * Show list of notes
         */
        _showNotes: function () {
        },

        /**
         * Show note's content
         */
        _showNote: function (id) {
            if (id === undefined || !this.Notes.get(id)) {
                return;
            }

            // Show content
            App.content.show(new NoteItem({
                model      : this.Notes.get(id),
                collection : this.Notes,
                configs    : this.configs
            }));
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

            // Show content
            this.showNoteContent(id);
        },

        /**
         * Show only favorite notes
         */
        noteFavorite: function (page, id) {
            var self = this;

            // Fetch and show notes
            this.Notes.fetch({
                conditions : {isFavorite : 1, trash: 0},
                limit      : this.Configs.get('pagination').get('value'),
                offset     : page,
                success : function () {
                    App.sidebar.show(new NoteSidebar({
                        collection : self.Notes,
                        configs    : self.configs,
                        page       : page,
                        url        : '/note/favorite'
                    }));

                    self.trigger('note:show', id);
                }
            });
        },

        /**
         * Show notes which is deleted
         */
        noteTrashed: function (page, id) {
            var self = this;

            // Fetch and show notes
            this.Notes.fetch({
                conditions : {trash : 1},
                limit      : this.Configs.get('pagination').get('value'),
                offset     : (page > 1) ? page : 0,
                success : function () {
                    App.sidebar.show(new NoteSidebar({
                        collection : self.Notes,
                        configs    : self.configs,
                        page       : page,
                        url        : '/note/trashed'
                    }));

                    self.trigger('note:show', id);
                }
            });
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
                id       = notebook;
                notebook = 0;
            }

            var self = this;

            // Fetch
            this.Notes.fetch({
                conditions : {trash: 0},
                limit   : this.configs.pagination,
                offset  : (page === 1) ? 0 : page,
                success : function () {
                    // Show sidebar
                    App.sidebar.show(new NoteSidebar({
                        page       : (page === undefined) ? 0 : page,
                        collection : self.Notes,
                        configs    : self.configs,
                        url        : '/note/' + notebook,
                        title      : 'Inbox'
                    }));

                    // Show content
                    self.trigger('note:show', id);
                }
            });
        },

        /**
         * Add a new note
         */
        noteAdd: function () {
            var self = this;

            // Form
            var content = new NoteForm({
                collection     : this.Notes,
                notebooks      : this.Notebooks,
                collectionTags : this.Tags,
                configs        : this.Configs,
                key            : this.configs.secureKey
            });

            // Fetch
            this.Notes.fetch({
                conditions : {trash: 0},
                limit   : this.configs.pagination,
                offset  : 0,
                success : function () {
                    // Show sidebar
                    App.sidebar.show(new NoteSidebar({
                        page       : 0,
                        collection : self.Notes,
                        configs    : self.configs,
                        url        : '/note/' + 0,
                        title      : 'Inbox'
                    }));

                    App.content.show(content);
                    content.trigger('shown');
                }
            });

            document.title = 'Creating new note';
        },

        /**
         * Edit an existing note
         */
        noteEdit: function (id) {
            var note,
                content;

            // Notes list is not visible yet
            if (this.Notes.length === 0) {
                this.index();
            }

            note = new this.Notes.model({id : id});
            content = new NoteForm({
                collection     : this.Notes,
                notebooks      : this.Notebooks,
                collectionTags : this.Tags,
                model          : note,
                configs        : this.Configs,
                key            : this.secureKey
            });

            // Fetch notes from DB and show edit form
            note.fetch({
                success: function () {
                    App.content.show(content);
                    content.trigger('shown');
                }
            });
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
