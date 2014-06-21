/*global define*/
define([
    'underscore',
    'backbone',
    'migrations/note',
    'models/notebook',
    'indexedDB'
], function (_, Backbone, NotesDB, Notebook) {
    'use strict';

    /**
     * Notebooks collection
     */
    var Notebooks = Backbone.Collection.extend({
        model: Notebook,

        database: NotesDB,
        storeName: 'notebooks',

        /**
         * Generates the next order number
         */
        nextOrder: function () {
            if ( !this.length) {
                return 1;
            }
            return this.last().get('id') + 1;
        },

        /**
         * Finds notebooks childrens
         */
        getChildrens: function () {
            return this.filter(function (notebook) {
                return notebook.get('parentId') !== 0;
            });
        },

        /**
         * Only root notebooks
         */
        getRoots:  function () {
            return this.without.apply(this, this.getChildrens());
        },

        /**
         * Filter: only unencrypted, JSON data probably encrypted data
         */
        getUnEncrypted: function () {
            return this.filter(function (notebook) {
                try {
                    JSON.parse(notebook.get('name'));
                    return false;
                } catch (e) {
                    return true;
                }
            });
        },

        /**
         * Decrypt all models in collection
         */
        decrypt: function () {
            var data = [];

            this.each(function (model) {
                data.push(model.decrypt());
            });

            return data;
        }

    });

    return Notebooks;
});
