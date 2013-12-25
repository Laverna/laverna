/*global define*/
define([
    'underscore',
    'app',
    'marionette',
    'models/note'
], function (_, App, Marionette, NoteModel) {
    'use strict';

    var Remove = App.module('AppNote.Remove');

    /**
     * Removes an existing note
     */
    Remove.Controller = Marionette.Controller.extend({
        initialize: function () {
            _.bindAll(this, 'remove', 'doRemove', 'redirect');
        },

        remove: function (id) {
            this.note = new NoteModel({ id : id });
            $.when(this.note.fetch()).done(this.doRemove);
        },

        doRemove: function () {
            // Destroy if note is already in trash
            if (this.note.get('trash') === 1) {
                $.when(this.note.destroy()).done(this.redirect);
            } else {
                $.when(this.note.save({'trash' : 1})).done(this.redirect);
            }
        },

        redirect: function () {
            App.navigateBack(-1);
        }
    });

    return Remove.Controller;
});
