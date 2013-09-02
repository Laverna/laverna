/*global define*/
define(['underscore', 'models/note', 'backbone', 'localStorage'], function (_, Note, Backbone) {
    'use strict';

    var Notes = Backbone.Collection.extend({
        model: Note,

        localStorage: new Backbone.LocalStorage('vimarkable.notes'),

        initialize: function () {
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
            this.fetch({
                success: function(data) {
                    console.log(data);
                }
            });
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
