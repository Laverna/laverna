/*global define*/
define([
    'underscore',
    'backbone',
    'collections/pageable',
    'migrations/note',
    'models/notebook',
    'indexedDB'
], function(_, Backbone, PageableCollection, NotesDB, Notebook) {
    'use strict';

    /**
     * Notebooks collection
     */
    var Notebooks = PageableCollection.extend({
        model: Notebook,

        database: NotesDB,
        storeName: 'notebooks',

        state: {
            pageSize     : 0,
            firstPage    : 1,
            totalPages   : 1,
            currentPage  : 0
        },

        comparator: 'name',

        sortItOut: function() {
            this.models = this.getTree();
        },

        _onAddItem: function(model) {
            this.add(model);
            this.reset(this.models);
        },

        _onRemoveItem: function(model) {
            this.remove(model);
            this.reset(this.models);
        },

        /**
         * Build a tree structure
         */
        getTree: function(parents, tree) {
            var self = this,
                childs;

            parents = (parents || this.getRoots());
            tree = (tree || []);

            _.forEach(parents, function(model) {
                tree.push(model);
                childs = self.getChildren(model.get('id'));

                // Every child model can have its own children
                if (childs.length > 0) {
                    childs = self.getTree(childs, tree);
                }
            });

            return tree;
        },

        /**
         * Finds notebooks children
         */
        getChildren: function(parentId) {
            return this.filter(function(model) {
                return model.get('parentId') === parentId;
            });
        },

        /**
         * Only root notebooks
         */
        getRoots:  function() {
            return this.filter(function(notebook) {
                return notebook.get('parentId') === '0';
            });
        },

        /**
         * Filter: only unencrypted, JSON data probably encrypted data
         */
        getUnEncrypted: function() {
            return this.filter(function(notebook) {
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
        decrypt: function() {
            var data = [];

            this.each(function(model) {
                data.push(model.decrypt());
            });

            return data;
        }

    });

    return Notebooks;
});
