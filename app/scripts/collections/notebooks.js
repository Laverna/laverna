/*global define*/
define([
    'underscore',
    'backbone',
    'migrations/notebooks',
    'models/notebook',
    'indexedDB',
    // 'localStorage',
], function (_, Backbone, NotebooksDB, Notebook) {
    'use strict';

    /**
     * Notebooks collection
     */
    var Notebooks = Backbone.Collection.extend({
        model: Notebook,

        //localStorage: new Backbone.LocalStorage('vimarkable.notebooks'),
        database: NotebooksDB,
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
        }

    });

    return Notebooks;
});
