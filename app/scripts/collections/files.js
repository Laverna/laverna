/*global define*/
define([
    'underscore',
    'jquery',
    'backbone',
    'models/file',
    'migrations/note',
    'toBlob'
], function (_, $, Backbone, File, FileDB, toBlob) {
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

        fetchImages: function (images) {
            var d = $.Deferred(),
                self = this,
                model;

            if (!images || images.length === 0) {
                d.resolve();
            }

            _.forEach(images, function (img, index) {
                model = new File({id: img});
                model.fetch({
                    success: function (model) {
                        model.set('src', toBlob(model.get('src')));
                        self.add(model);

                        if (index === (images.length - 1) ) {
                            d.resolve(self);
                        }
                    },

                    error: function (e) {
                        d.error(e);
                    }
                });
            });

            return d;
        },

        uploadImages: function (imgs) {
            var d = $.Deferred(),
                self = this,
                models = [],
                model;

            _.forEach(imgs, function (img, index) {
                model = new File();
                model.set(img);

                self.create(model, {
                    success: function (m) {
                        models.push(m);
                        if (index === ( imgs.length - 1 )) {
                            d.resolve(models);
                        }
                    },
                    error: function (e) {
                        d.reject(e);
                    }
                });

            });
            return d;
        }
    });

    return Files;
});
