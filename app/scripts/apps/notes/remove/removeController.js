/*global define*/
define([
    'underscore',
    'app',
    'helpers/uri',
    'marionette',
    'models/note',
    'collections/notes',
], function (_, App, URI, Marionette, NoteModel, NoteCollection) {
    'use strict';

    var Remove = App.module('AppNote.Remove');

    /**
     * Removes an existing note
     */
    Remove.Controller = Marionette.Controller.extend({

        initialize: function () {
            _.bindAll(this, 'remove', 'doRemove', 'redirect');
        },

        remove: function (args) {
            this.note = new NoteModel({ id : args.id });
            this.note.database.getDB(args.profile);
            $.when(this.note.fetch()).done(this.doRemove);
        },

        doRemove: function () {
            // Destroy if note is already in trash
            if (this.note.get('trash') === 1) {
                var self = this;
                $.when(this.note.destroy()).done(function () {
                    self.syncDirty();
                    self.redirect();
                });
            }
            else {
                $.when(this.note.save({'trash' : 1})).done(this.redirect);
            }
        },

        syncDirty: function () {
            var notes = new NoteCollection();
            notes.syncDirty(this.note);
            this.redirect();
        },

        redirect: function () {
            App.content.reset();
            App.trigger('notes:rerender');

            App.navigate(URI.link('/notes'), false);
            App.trigger('notes:next');
        }

    });

    return Remove.Controller;
});
