/*global define*/
define(['models/note', 'backbone', 'localStorage'], function (Note, Backbone) {
    'use strict';

    var Notes = Backbone.Collection.extend({
        model: Note,

        localStorage: new Backbone.LocalStorage('vimarkable.notes'),

        initialize: function () {
            this.on('add', this.setId);
        },

        setId: function (note) {
            note.set('id', this.getNewId());
        },

        /**
         * Generates a new id for new note
         */
        getNewId: function () {
            if ( ! this.length) {
                return 1;
            }
            return this.last().get('id') + 1;
        },

        /**
         * Filter the list of all notes that are favorite
         */
        getFavorites: function () {
            return this.filter(function (note) {
                return note.get('isFavorite') === 1;
            });
        }
    });

    return Notes;
});
