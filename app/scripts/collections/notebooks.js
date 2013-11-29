/*global define*/
define([
    'underscore',
    'backbone',
    'models/notebook',
    'localStorage'
], function (_, Backbone, Notebook) {
    'use strict';

    /**
     * Notebooks collection
     */
    var Notebooks = Backbone.Collection.extend({
        model: Notebook,

        localStorage: new Backbone.LocalStorage('vimarkable.notebooks'),

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
         * Get next or previous notebook
         */
        navigate: function (id, direction) {
            var notebooks = this.getRoots(),
                notebook,
                i;

            notebook = this.get(id);
            i = _.indexOf(notebooks, notebook);

            if (direction === 'prev') {
                i = (i > 0) ? i - 1 : 0;
            } else {
                i = (i === (notebooks.length - 1)) ? i : i + 1;
            }

            notebook = notebooks[i];

            if (direction === 'next' && notebook.get('id') === id) {
                return null;
            } else {
                return notebook;
            }
        }

    });

    return Notebooks;
});
