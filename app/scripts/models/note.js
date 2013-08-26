/*global define*/
define(['underscore', 'backbone'], function(_, Backbone){
    'use strict';
    var Model = Backbone.Model.extend({
        defaults: {
            'id': 0,
            'notebookId': 0,
            'title': '',
            'content': '',
            'taskAll': 0,
            'taskCompleted': 0,
            'created': null,
            'updated': null,
            'tagsId': [],
            'isFavorite': 0
        }
    });
    return Model;
});
