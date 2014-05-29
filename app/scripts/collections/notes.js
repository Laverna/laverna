/*global define*/
define([
    'underscore',
    'app',
    'backbone',
    'migrations/note',
    'models/note',
    'indexedDB'
], function (_, App, Backbone, NotesDB, Note) {
    'use strict';

    var Notes = Backbone.Collection.extend({
        model: Note,

        database  : NotesDB,
        storeName : 'notes',

        initialize: function () {
        },

        comparator: function (model) {
            return -model.get('created');
        },

        filterList: function (filter) {
            var res;
            switch (filter) {
            case 'favorite':
                res = this.getFavorites();
                break;
            case 'trashed':
                res = this.getTrashed();
                break;
            default:
                res = this.getActive();
                break;
            }
            return this.reset(res);
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
        getTagged: function ( tagName ) {
            return this.filter(function (note) {
                if (note.get('tags').length > 0) {
                    return (_.indexOf(note.get('tags'), tagName) !== -1) && note.get('trash') === 0;
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
         * Filter: only unencrypted, JSON data probably encrypted data
         */
        getUnEncrypted: function () {
            return this.filter(function (note) {
                try {
                    JSON.parse(note.get('title'));
                    return false;
                } catch (e) {
                    return true;
                }
            });
        },

        /**
         * Search
         */
        search : function(letters) {
            if(letters === '') {
                return this;
            }

            var pattern = new RegExp(letters, 'gi'),
                title, content;

            return this.filter(function(model) {
                title = App.Encryption.API.decrypt(model.get('title'));
                content = App.Encryption.API.decrypt(model.get('content'));
                return pattern.test(title) || pattern.test(content);
            });
        },

        /**
         * Pagination
         * @var int perPage
         * @var int page
         */
        pagination : function (page, perPage) {
            var collection = this;

            collection = _(collection.rest(page));
            collection = _(collection.first(perPage));

            return collection.map( function(model) {
                return model;
            });
        }

    });

    return Notes;
});
