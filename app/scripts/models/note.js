/*global define*/
define([
    'underscore',
    'backbone',
    'models/notebook',
    'collections/notebooks',
    'backbone.relational',
    'localStorage'
], function (_, Backbone, Notebook, Notebooks) {
    'use strict';

    /**
     * Notes model
     */
    // var Model = Backbone.Model.extend({
    var Model = Backbone.RelationalModel.extend({
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
                type           : Backbone.HasOne,
                key            : 'notebookId',
                relatedModel   : Notebook,
                collectionType : Notebooks,
                reverseRelation: {
                    key           : 'notes',
                    includeInJSON : 'id'
                }
            }
        ],

        initialize: function () {
            this.on('update.note', this.setUpdate);

            if (this.isNew()) {
                this.set('created', Date.now());
                this.setUpdate();
            }
        },

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
