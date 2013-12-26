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

            this.note.on('change', this.triggerChangeToSidebar, this);
            this.note.on('updateTaskProgress', this.updateTaskProgress, this);

            $.when(
                this.note.fetch()
            ).done(this.showContent);
        },

        showContent: function () {
            var decrypted, args;

            decrypted = {
                title   : App.Encryption.API.decrypt(this.note.get('title')),
                content : App.Encryption.API.decrypt(this.note.get('content'))
            };

            args = {
                model     : this.note,
                decrypted : decrypted,
                args      : this.args
            };

            App.content.show(new NoteView(args));
        },

        triggerChangeToSidebar: function () {
            App.trigger('notes:changeModel', this.note.get('id'));
        },

        updateTaskProgress: function (text) {
            var content = App.Encryption.API.encrypt(text.content);

            this.note.save({
                content       : content,
                taskCompleted : text.completed
            });
        }

    });

    return Show.Controller;
});
