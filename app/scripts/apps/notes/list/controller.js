/*global define*/
define([
    'underscore',
    'app',
    'marionette',
    'collections/notes',
    'apps/notes/list/views/noteSidebar'
], function (_, App, Marionette, Notes, NotesView) {
    'use strict';

    var List = App.module('AppNote.List');

    /**
     * Notes list controller - shows notes list in sidebar
     */
    List.Controller = Marionette.Controller.extend({
        initialize: function () {
            _.bindAll(this, 'listNotes', 'showSidebar');

            // Fetch events
            this.on('controller:all', this.activeNotes, this);
            this.on('controller:favorite', this.favoriteNotes, this);
            this.on('controller:trashed', this.trashedNotes, this);

            // Application events
            App.on('notes:show', this.changeFocus, this);
            App.on('navigateTop', this.toPrevNote, this);
            App.on('navigateBottom', this.toNextNote, this);
        },

        /**
         * Fetch notes, then show it
         */
        listNotes: function (args) {
            this.notes = new Notes();
            this.args = args;

            if (this.args.filter) {
                this.trigger('controller:' + this.args.filter);
            } else {
                this.trigger('controller:all');
            }
        },

        /**
         * Show only active notes
         */
        activeNotes: function () {
            $.when(
                this.notes.fetch({
                    offset : 0,
                    limit  : App.settings.pagination,
                    conditions: {trash : 0}
                })
            ).done(this.showSidebar);
        },

        /**
         * Show favorite notes
         */
        favoriteNotes: function () {
            $.when(
                this.notes.fetch({
                    offset : 0,
                    limit  : App.settings.pagination,
                    conditions: {isFavorite : 1}
                })
            ).done(this.showSidebar);
        },

        /**
         * Show only removed notes
         */
        trashedNotes: function () {
            $.when(
                this.notes.fetch({
                    offset : 0,
                    limit  : App.settings.pagination,
                    conditions: {trash : 1}
                })
            ).done(this.showSidebar);
        },

        /**
         * Show content
         */
        showSidebar: function () {
            var View = new NotesView({
                collection : this.notes,
                args       : this.args
            });

            App.sidebar.show(View);

            // Active note
            if (this.args.id !== undefined) {
                this.changeFocus(this.args);
            }
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
            var url = '/notes';

            if (this.args.filter) {
                url += '/f/' + this.args.filter;
            }
            if (this.args.page) {
                url += '/page' + this.args.page;
            }

            return App.navigate(url + '/show/' + note.get('id'), true);
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
            if ( !this.args.id) {
                note = this.notes.at(0);
            } else {
                note = this.notes.get(this.args.id);
                note = note.next();
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
            if ( !this.args.id && this.args.page > App.settings.pagination) {
                note = this.notes.at(App.settings.pagination);
            } else {
                note = this.notes.get(this.args.id);
                note = note.prev();
            }

            return this.toNote(note);
        }

    });

    return List.Controller;
});
