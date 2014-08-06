/*global define*/
define([
    'underscore',
    'app',
    'backbone',
    'marionette',
    'helpers/uri',
    'collections/notes',
    'apps/notes/list/views/noteSidebar'
], function (_, App, Backbone, Marionette, URI, Notes, NotesView) {
    'use strict';

    var List = App.module('AppNote.List');

    /**
     * Notes list controller - shows notes list in sidebar
     */
    List.Controller = Marionette.Controller.extend({

        initialize: function () {
            _.bindAll(this, 'listNotes', 'showSidebar', 'favoriteNotes');

            this.notes = new Notes();

            // Application events
            App.on('notes:show', this.changeFocus, this);
            App.on('notes:next', this.toNextNote, this);

            // Filter
            this.listenTo(this.notes, 'filter:all', this.activeNotes, this);
            this.listenTo(this.notes, 'filter:favorite', this.favoriteNotes, this);
            this.listenTo(this.notes, 'filter:trashed', this.trashedNotes, this);
            this.listenTo(this.notes, 'filter:search', this.searchNotes, this);
            this.listenTo(this.notes, 'filter:tag', this.taggedNotes, this);
            this.listenTo(this.notes, 'filter:notebook', this.notebooksNotes, this);

            // Navigation with keys
            this.listenTo(this.notes, 'navigateTop', this.toPrevNote, this);
            this.listenTo(this.notes, 'navigateBottom', this.toNextNote, this);
        },

        /**
         * Fetch notes, then show it
         */
        listNotes: function (args) {
            this.args = _.clone(args) || this.args;
            App.settings.pagination = parseInt(App.settings.pagination);

            // Set profile
            this.notes.database.getDB(args.profile);

            // Offset
            if (_.isNull(this.args.page)) {
                this.args.page = 0;
            } else {
                this.args.page = parseInt(this.args.page);
            }

            this.query = {};

            // Filter
            if (_.isNull(this.args) === false && this.args.filter) {
                this.notes.trigger('filter:' + this.args.filter);
            } else {
                this.notes.trigger('filter:all');
            }
        },

        /**
         * Show only active notes
         */
        activeNotes: function () {
            $.when(
                this.notes.fetch({
                    // offset : this.args.page,
                    // limit  : App.settings.pagination,
                    conditions: ( window.appNoDB ? null : {'trash' : 0} )
                })
            ).done(this.showSidebar);
        },

        /**
         * Show favorite notes
         */
        favoriteNotes: function () {
            $.when(
                this.notes.fetch({
                    conditions: ( window.appNoDB ? null : {isFavorite : 1} )
                })
            ).done(this.showSidebar);
        },

        /**
         * Show only removed notes
         */
        trashedNotes: function () {
            $.when(
                this.notes.fetch({
                    conditions: ( window.appNoDB ? null : {trash : 1} )
                })
            ).done(this.showSidebar);
        },

        /**
         * Notes with notebook
         */
        notebooksNotes: function () {
            $.when(
                this.notes.fetch({
                    conditions: ( window.appNoDB ? null : {notebookId : this.args.query} )
                })
            ).done(this.showSidebar);
        },

        /**
         * Notes which tagged with :tag
         */
        taggedNotes: function () {
            var self = this,
                notes;
            $.when(
                this.notes.fetch({
                    conditions: ( window.appNoDB ? null : {trash : 0} )
                })
            ).done(
                function () {
                    notes = self.notes.getTagged(self.args.query);
                    self.notes.reset(notes);
                    self.showSidebar();
                }
            );
        },

        /**
         * Search notes
         */
        searchNotes: function () {
            var self = this,
                notes;
            $.when(
                // Fetch without limit, because with encryption, searching is impossible
                this.notes.fetch({
                    conditions: {trash : 0}
                })
            ).done(
                function () {
                    notes = self.notes.search(self.args.query);
                    self.notes.reset(notes);
                    self.showSidebar();
                }
            );
        },

        /**
         * Show content
         */
        showSidebar: function () {
            // IndexedDBShim doesn't support indexes - filter with backbone.js
            if (window.appNoDB === true) {
                this.notes.filterList(this.args.filter, this.args.query);
            }

            this.args.isLastPage = this.notes.length <= (this.args.page + App.settings.pagination);

            // Pagination
            if (this.notes.length > App.settings.pagination) {
                var notes = this.notes.pagination(this.args.page, App.settings.pagination);
                this.notes.reset(notes);
            }
            else if (this.args.page > 1) {
                this.notes.reset([]);
            }

            // Next page
            if (this.notes.length === App.settings.pagination) {
                this.args.next = this.args.page + App.settings.pagination;
            } else {
                this.args.next = this.args.page;
            }

            // Previous page
            if (this.args.page > App.settings.pagination) {
                this.args.prev = this.args.page - App.settings.pagination;
            }

            var View = new NotesView({
                collection : this.notes,
                args       : this.args
            });

            App.sidebar.show(View);

            // Active note
            if (this.args.id) {
                this.changeFocus(this.args);
            }

            App.AppNavbar.trigger('titleChange', this.args);
        },

        changeFocus: function (args) {
            if ( !args ) { return; }
            this.args = args;
            this.notes.trigger('changeFocus', args.id);
        },

        /**
         * Redirects to note
         */
        toNote: function (note) {
            if ( !note) { return; }

            var url = URI.note(this.args, note);
            return App.navigate(url, true);
        },

        /**
         * Navigate to next note
         */
        toNextNote: function () {
            // Nothing is here
            if (this.notes.length === 0) {
                return;
            }

            var note;
            try {
                note = this.notes.get(this.args.id);
                note = note.next();
            }
            catch (e) {
                note = this.notes.at(0);
            }

            if (this.notes.length >= App.settings.pagination && this.notes.indexOf(note) < 0) {
                this.notes.trigger('nextPage');
            }

            return this.toNote(note);
        },

        /**
         * Navigate to previous note
         */
        toPrevNote: function () {
            // Nothing is here
            if (this.notes.length === 0) {
                return;
            }

            var note;
            try {
                note = this.notes.get(this.args.id);
                note = note.prev();
            }
            catch (e) {
                note = this.notes.last();
            }

            if (this.args.page > 1 && this.notes.indexOf(note) < 0) {
                this.notes.trigger('prevPage');
            }

            return this.toNote(note);
        }

    });

    return List.Controller;
});
