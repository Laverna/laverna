/*global define*/
define(['models/note', 'backbone', 'underscore', 'localStorage'], function (Note, Backbone, _) {
    'use strict';

    var Notes = Backbone.Collection.extend({
        model: Note,

        localStorage: new Backbone.LocalStorage('vimarkable.notes'),

        /**
         * Generates tags for note
         */
        setTags: function(tagsId){
            if ( _.isString(tagsId) ) {
                tagsId = tagsId.split(',');
                _.forEach(tagsId, function(item, index){
                    tagsId[index] = $.trim(item);
                });
            }
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
        },

        /**
         * Only active notes
         */
        getActive: function () {
            return this.without.apply(this, this.getTrashed());
        },

        /**
         * Filter the list of notes that are removed to trash
         */
        getTrashed: function () {
            return this.filter(function (note) {
                return note.get('trash') === 1;
            });
        },

        /**
         * Search
         */
        search : function(letters){
            if(letters === '') {
                return this;
            }

            var pattern = new RegExp(letters, 'gi');
            return this.filter(function(model) {
                return pattern.test(model.get('title'));
            });
        }
    });

    return Notes;
});
