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

            $.when(this.notes.fetch()).done(this.showSidebar);
        },

        showSidebar: function () {
            var notes = this.filterNotes(),
                View = new NotesView({
                    collection : notes,
                    args       : this.args
                });

            App.sidebar.show(View);

            // Active note
            if (this.args.id !== undefined) {
                this.changeFocus(this.args);
            }
        },

        filterNotes: function () {
            var notes = this.notes.clone();

            // Filter
            switch (this.args.filter) {
                case 'favorite':
                    notes = notes.getFavorites();
                    break;
                case 'trashed':
                    notes = notes.getTrashed();
                    break;
                case 'search':
                    notes = notes.search(this.options.searchQuery, this.options.key, this.options.configs);
                    break;
                case 'tagged':
                    notes = notes.getTagNotes(parseInt(this.options.tagId));
                    break;
                default:
                    if (0 !== 0) {
                        notes = notes.getNotebookNotes(this.options.notebookId);
                    } else {
                        notes = notes.getActive();
                    }
                    break;
            }

            this.notes = new Notes(notes);
            return this.notes;
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
