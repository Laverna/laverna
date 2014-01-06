/*global define*/
define([
    'underscore',
    'backbone',
    'app',
    'migrations/notebooks',
    'models/notebook',
    'indexedDB'
    // 'localStorage',
], function (_, Backbone, App, NotebooksDB, Notebook) {
    'use strict';

    /**
     * Notebooks collection
     */
    var Notebooks = Backbone.Collection.extend({
        model: Notebook,

        //localStorage: new Backbone.LocalStorage('vimarkable.notebooks'),
        database: NotebooksDB,
        storeName: 'notebooks',
        store: 'notebooks',

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
