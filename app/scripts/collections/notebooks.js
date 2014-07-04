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
         * Filter for tree structure
         */
        getTree: function (parents, tree) {
            var self = this,
                childs;

            parents = (parents || this.getRoots());
            tree = (tree || []);

            _.forEach(parents, function (model) {
                tree.push(model);
                childs = self.getChilds(model.get('id'));

                if (childs.length > 0) {
                    childs = self.getTree(childs, tree);
                }
            });

            return tree;
        },

        getChilds: function (parentId) {
            return this.filter(function (model) {
                return model.get('parentId') === parentId;
            });
        },

        /**
         * Finds notebooks childrens
         */
        getChildrens: function () {
            return this.filter(function (notebook) {
                return notebook.get('parentId') !== '0';
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
