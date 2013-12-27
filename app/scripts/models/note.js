/*global define*/
define([
    'underscore',
    'backbone',
    'indexedDB',
    'migrations/note',
    'backbone.assosiations'
    // 'localStorage',
], function (_, Backbone, IndexedDB, NotesDB) {
    'use strict';

    /**
     * Notes model
     */
    // var Model = Backbone.Model.extend({
    var Model = Backbone.AssociatedModel.extend({

        idAttribute: 'id',

        // localStorage: new Backbone.LocalStorage('vimarkable.notes'),
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
            'trash'         :  0
        },

        relations: [
            //{
            //    type           : Backbone.One,
            //    key            : 'notebookId',
            //    collectionType : Notebooks,
            //    relatedModel   : Notebook
            //}
        ],

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
            this.on('update.note', this.setUpdate);
            this.on('changed:notebookId', this.updateNotebookCount);

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
        }

    });

    return Model;
});
