/*global define*/
define(['models/note', 'backbone', 'underscore', 'localStorage'], function (Note, Backbone, _) {
    'use strict';

    var Notes = Backbone.Collection.extend({
        model: Note,

        localStorage: new Backbone.LocalStorage('vimarkable.notes'),

        initialize: function () {
        },

        /**
         * Generates tags for note
         */
        getTags: function(note){
            var tagsId = note.get('tagsId').split(',');
            _.forEach(tagsId, function(item, index){
                tagsId[index] = $.trim(item);
            });
            return tagsId;
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
