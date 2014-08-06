/*global define*/
define([
    'underscore',
    'backbone',
    'migrations/note',
    'collections/removed',
    'apps/encryption/auth',
    'indexedDB'
], function (_, Backbone, NotesDB, Removed, getAuth) {
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
            'created'       :  Date.now(),
            'updated'       :  Date.now(),
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
            this.on('update:any', this.updateDate);
            this.on('setFavorite', this.setFavorite);

            if (this.isNew()) {
                this.set('created', Date.now());
                this.updateDate();
            }
        },

        encrypt: function (data) {
            var auth = getAuth();
            data = data || this.toJSON();

            this.set('title', auth.encrypt(data.title));
            this.set('content', auth.encrypt(data.content));
            this.set('synchronized', 0);
        },

        decrypt: function () {
            var data = this.toJSON(),
                auth = getAuth();

            data.title = auth.decrypt(data.title);
            data.content = auth.decrypt(data.content);
            return data;
        },

        /**
         * Note's last modified time
         */
        updateDate: function () {
            this.set('updated', Date.now());
            this.setSync();
        },

        /**
         * Saves model's id for sync purposes, then destroys it
         */
        destroySync: function () {
            return new Removed().newObject(this, arguments);
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
