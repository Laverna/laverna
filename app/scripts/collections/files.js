/*global define*/
define([
    'underscore',
    'jquery',
    'backbone',
    'models/file',
    'migrations/note'
], function (_, $, Backbone, File, FileDB) {
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

        uploadImages: function (imgs) {
            var d = $.Deferred(),
                models = [],
                model;

            console.log('before foreach');
            _.forEach(imgs, function (img, index) {
                model = new File();
                model.set(img);
                console.log(model);
                $.when(model.save()).done(function () {
                    models.push(model);
                    if (index === ( imgs.length - 1 )) {
                        d.resolve(models);
                    }
                }).fail(function (e) {
                    console.log(e);
                    d.reject(e);
                });

            });
            return d;
        }
    });

    return Files;
});
