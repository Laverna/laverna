/*global define*/
// /*global sjcl*/
define([
    'underscore',
    'backbone',
    'models/notebook',
    'collections/notebooks',
    'collections/tags',
    // 'sjcl',
    'backbone.assosiations',
    'localStorage'
], function (_, Backbone, Notebook, Notebooks, Tags) {
    'use strict';

    /**
     * Notes model
     */
    // var Model = Backbone.Model.extend({
    var Model = Backbone.AssociatedModel.extend({
        idAttribute: 'id',

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
            {
                type           : Backbone.One,
                key            : 'notebookId',
                collectionType : Notebooks,
                relatedModel   : Notebook
            }
        ],

        initialize: function () {
            this.on('update.note', this.setUpdate);
            this.on('changed:notebookId', this.updateNotebookCount);

            if (this.isNew()) {
                this.set('created', Date.now());
                this.setUpdate();
            }
        },

        /**
         * Tags
         */
        getTags: function () {
            var tagsCollection = new Tags(),
                tags = [];

            tagsCollection.fetch();

            if (this.get('tags').length === 0) {
                return tags;
            }

            _.each(this.get('tags'), function (id) {
                if (id !== undefined && id !== '') {
                    tags.push(tagsCollection.get(id));
                }
            });

            return tags;
        },

        updateNotebookCount: function (args) {
            var notebook = this.get('notebookId');

            if (args.last !== 0) {
                args.last.trigger('removed:note');
            }

            if (notebook !== 0) {
                notebook.trigger('add:note');
            }
        },

        /**
         * Note's last modified time
         */
        setUpdate: function () {
            this.set('updated', Date.now());

            // Encrypt content
            // console.log(sjcl);

            // Encrypt title
        }

    });

    return Model;
});
