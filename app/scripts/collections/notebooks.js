/*global define*/
define([
    'underscore',
    'backbone',
    'collections/pageable',
    'backbone.radio',
    'migrations/note',
    'models/notebook',
    'indexedDB'
], function(_, Backbone, PageableCollection, Radio, NotesDB, Notebook) {
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

        conditions: {
            active: {trash: 0}
        },

        sortField: 'name',

        comparator: function(model) {
            return -model.get(this.sortField);
        },

        sortItOut: function() {
            this.models = this.getTree();
        },

        sortFullCollection: function() {
            this.sortItOut();
            this.reset(this.models);
        },

        _onAddItem: function(model) {
            /**
             * Remove a model from the collection if it doesn't meet
             * the current filter condition.
             */
            if (!model.matches(this.conditionCurrent || {trash: 0})) {
                return this._navigateOnRemove(model);
            }

            var colModel = this.get(model.id);
            if (colModel) {
                colModel.set(model.attributes);
            }
            else {
                this.add(model);
            }

            this.sortFullCollection();
            Radio.trigger('notebooks', 'model:navigate', model);
        },

        /**
         * Return only notebooks that are not related to a specified notebook.
         */
        rejectTree: function(id) {
            var ids = [id];
            return this.filter(function(model) {
                if (_.indexOf(ids, model.id) > -1 ||
                    _.indexOf(ids, model.get('parentId')) > -1) {

                    ids.push(model.id);
                    return false;
                }

                return true;
            });
        },

        /**
         * Build a tree structure
         */
        getTree: function(parents, tree) {
            var self = this,
                children;

            parents = (parents || this.getRoots());
            tree = (tree || []);

            _.forEach(parents, function(model) {
                tree.push(model);
                children = self.getChildren(model.get('id'));

                // Every child model can have its own children
                if (children.length > 0) {
                    children = self.getTree(children, tree);
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
        }

    });

    return Notebooks;
});
