/*global define*/
define([
    'underscore',
    'backbone',
    'app',
    'migrations/note',
    'models/notebook',
    'indexedDB'
], function (_, Backbone, App, NotesDB, Notebook) {
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

        decrypt: function () {
            var data = this.toJSON();

            _.forEach(data, function (model) {
                model.name = App.Encryption.API.decrypt(model.name);
            });

            return data;
        }

    });

    return Notebooks;
});
