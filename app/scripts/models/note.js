/*global define*/
define([
    'underscore',
    'backbone',
    'migrations/note',
    'collections/removed',
    'dompurify',
    'indexedDB'
], function(_, Backbone, NotesDB, Removed, Purify) {
    'use strict';

    /**
     * Notes model
     */
    var Model = Backbone.Model.extend({

        idAttribute: 'id',

        database  : NotesDB,
        storeName : 'notes',

        defaults: {
            'type'          : 'notes',
            'id'            :  undefined,
            'title'         :  '',
            'content'       :  '',
            'taskAll'       :  0,
            'taskCompleted' :  0,
            'created'       :  0,
            'updated'       :  0,
            'notebookId'    :  '0',
            'tags'          :  [],
            'isFavorite'    :  0,
            'trash'         :  0,
            'synchronized'  :  0,
            'files'         :  []
        },

        encryptKeys: [
            'title',
            'content'
        ],

        validate: function(attrs) {
            // It's not neccessary to validate when a model is about to be removed
            if (attrs.trash && Number(attrs.trash) === 2) {
                return;
            }

            var errors = [];
            if (!_.isUndefined(attrs.title) && !attrs.title.trim().length) {
                errors.push('title');
            }

            if (errors.length > 0) {
                return errors;
            }
        },

        initialize: function() {
        },

        /**
         * Note's last modified time
         */
        updateDate: function() {
            this.set('updated', Date.now());
            this.setSync();
        },

        /**
         * Saves model's id for sync purposes, then destroys it
         */
        destroySync: function() {
            return new Removed().newObject(this, arguments);
        },

        toggleFavorite: function() {
            return {isFavorite: (this.get('isFavorite') === 1) ? 0 : 1};
        },

        setSync: function() {
            this.set('synchronized', 0);
        },

        /**
         * Purify user inputs
         */
        setEscape: function(data) {
            if (data.title) {
                data.title = _.escape(_.unescape(data.title));
            }
            if (data.content) {
                data.content = Purify.sanitize(data.content);
            }

            this.set(data);
            return this;
        }

    });

    return Model;
});
