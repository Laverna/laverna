/*global define*/
define(['underscore', 'backbone', 'localStorage'], function (_, Backbone) {
    'use strict';

    var Model = Backbone.Model.extend({

        defaults: {
            'id'            :  undefined,
            'notebookId'    :  0,
            'title'         :  '',
            'content'       :  '',
            'taskAll'       :  0,
            'taskCompleted' :  0,
            'created'       :  null,
            'updated'       :  null,
            'tagsId'        :  [],
            'isFavorite'    :  0,
            'trash'         :  0
        },

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
