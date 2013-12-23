/*global define*/
define([
    'underscore',
    'app',
    'marionette',
    'models/note',
    'apps/notes/show/noteView'
], function (_, App, Marionette, NoteModel, NoteView) {
    'use strict';

    var Show = App.module('AppNote.Show');

    /**
     * Controller shows note's content in App.content
     */
    Show.Controller = Marionette.Controller.extend({
        initialize: function () {
            _.bindAll(this, 'showNote', 'showContent');
        },

        /**
         * Fetch note, then show it
         */
        showNote: function (args) {
            this.note = new NoteModel({ id : args.id });
            this.args = args;

            $.when(this.note.fetch()).done(this.showContent);
        },

        showContent: function () {
            var args = {
                model   : this.note,
                args    : this.args,
                configs : {}
            };

            App.content.show(new NoteView(args));
        },

    });

    return Show.Controller;
});
