/*global define*/
define([
    'underscore',
    'backbone',
    'models/file',
    'migrations/note'
], function(_, Backbone, File, DB) {
    'use strict';

    /**
     * Files collection
     */
    var Files = Backbone.Collection.extend({
        model: File,

        database : DB,
        storeName: 'files',

    });

    return Files;
});
