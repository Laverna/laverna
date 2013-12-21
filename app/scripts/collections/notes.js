/*global define*/
define([
    'underscore',
    'backbone',
    'migrations/note',
    'models/note',
    // 'localStorage',
    'indexedDB',
    'sjcl'
], function (_, Backbone, NotesDB, Note) {
    'use strict';

    var Notes = Backbone.Collection.extend({
        model: Note,

        // localStorage: new Backbone.LocalStorage('vimarkable.notes'),
        database  : NotesDB,
        storeName : 'notes',

        initialize: function () {
        },

        comparator: function (model) {
            return -model.get('created');
        },

        setEncryptionData: function (data) {
            this.encryptionData = data;
        },

        getEncryptionData: function () {
            return this.encryptionData;
        },

        /**
         * Filter the list of all notes that are favorite
         */
        getFavorites: function () {
            return this.filter(function (note) {
                return note.get('isFavorite') === 1 && note.get('trash') === 0;
            });
        },

        /**
         * Only active notes
         */
        getActive: function () {
            return this.without.apply(this, this.getTrashed());
        },

        /**
         * Show only notebook's notes
         */
        getNotebookNotes: function ( notebookId ) {
            return this.filter(function (note) {
                var notebook = note.get('notebookId');

                if (notebook !== 0) {
                    return notebook.get('id') === notebookId && note.get('trash') === 0;
                }
            });
        },

        /**
         * Show only tag's notes
         */
        getTagNotes: function ( tagId ) {
            return this.filter(function (note) {
                if (note.get('tags').length > 0) {
                    return (_.indexOf(note.get('tags'), tagId) !== -1) && note.get('trash') === 0;
                }
            });
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
        search : function(letters) {
            if(letters === '') {
                return this;
            }

            var pattern = new RegExp(letters, 'gi');
            return this.filter(function(model) {
                return pattern.test(model.get('title'));
            });
        },

        /**
         * Pagination
         * @var int perPage
         * @var int page
         * @var string filter
         */
        pagination : function (perPage, page, filter) {
            if (filter === 'active') {
                this.reset(this.getActive());
            }

            var collection = this;
            page = page - 1;

            collection = _(collection.rest(perPage * page));
            collection = _(collection.first(perPage));

            return collection.map( function(model) {
                return model;
            });
        }
    });

    // Fetch all records
    //var notes = new Notes();
    //notes.fetch();

    return Notes;
});
