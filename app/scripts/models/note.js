/*global define*/
define([
    'underscore',
    'backbone',
    'models/notebook',
    'collections/notebooks',
    'backbone.assosiations',
    'localStorage'
], function (_, Backbone, Notebook, Notebooks) {
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
            'tagsId'        :  [],
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
            this.setTags();
        },

        /**
         * Generates tags for note
         */
        setTags: function () {
            var tagsId = this.get('tagsId');

            if ( _.isString(tagsId) ) {
                tagsId = tagsId.split(',');
                _.forEach(tagsId, function(item, index){
                    tagsId[index] = $.trim(item);
                });
            }

            return tagsId;
        }
    });

    return Model;
});
