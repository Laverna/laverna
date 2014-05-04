/*global define*/
define([
    'underscore',
    'backbone',
    'migrations/note',
    'indexedDB'
], function (_, Backbone, NotesDB) {
    'use strict';

    /**
     * Notes model
     */
    var Model = Backbone.Model.extend({

        idAttribute: 'id',

        database  : NotesDB,
        storeName : 'notes',

        defaults: {
            'id'            :  undefined,
            'title'         :  '',
            'content'       :  '',
            'taskAll'       :  0,
            'taskCompleted' :  0,
            'created'       :  null,
            'updated'       :  null,
            'notebookId'    :  0,
            'tags'          :  [],
            'isFavorite'    :  0,
            'trash'         :  0,
            'synchronized'  :  0,
            'images'        :  []
        },

        validate: function (attrs) {
            var errors = [];
            if (attrs.title === '') {
                errors.push('title');
            }

            if (errors.length > 0) {
                return errors;
            }
        },

        initialize: function () {
            this.on('update:any', this.setUpdate);
            this.on('setFavorite', this.setFavorite);

            if (this.isNew()) {
                this.set('created', Date.now());
                this.setUpdate();
            }
        },

        /**
         * Note's last modified time
         */
        setUpdate: function () {
            this.set('updated', Date.now());
            this.setSync();
        },

        next: function () {
            if (this.collection) {
                return this.collection.at(this.collection.indexOf(this) + 1);
            }
        },

        prev: function () {
            if (this.collection) {
                return this.collection.at(this.collection.indexOf(this) - 1);
            }
        },

        setFavorite: function () {
            var isFavorite = (this.get('isFavorite') === 1) ? 0 : 1;
            this.trigger('update:any');
            this.save({'isFavorite': isFavorite});
        },

        setSync: function () {
            this.set('synchronized', 0);
        }

    });

    return Model;
});
