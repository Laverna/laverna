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
                args = {
                    collection : notes,
                    configs    : {},
                    args       : this.args
                };

            // Active note
            if (this.args.id !== undefined) {
                args.activeNote = this.notes.get(this.args.id);
            }

            App.sidebar.show(new NotesView(args));
        },

        changeFocus: function (args) {
            this.notes.trigger('changeFocus', args.id);
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

    });

    return List.Controller;
});
