/*global define*/
define([
    'underscore',
    'backbone',
    'models/file',
    'migrations/note'
], function (_, Backbone, File, FileDB) {
    'use strict';

    /**
     * Files collection
     */
    var Files = Backbone.Collection.extend({
        model: File,

        database : FileDB,
        storeName: 'files',

        initialize: function () {
        },
    });

    return Files;
});
