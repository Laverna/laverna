/**
 * Replaces MD code like ![](#image-id) to ![](base64://image-code)
 */
define(['underscore', 'jquery', 'toBlob'], function (_, $, toBlob) {
    'use strict';

    var Images = function () { };

    _.extend(Images.prototype, {
        urls : [],

        toHtml: function (text, images) {
            var url = window.URL || window.webkitURL,
                self = this,
                urlImage,
                blob;

            this.urls = [];

            images.forEach(function (img, index) {
                blob = toBlob(img.get('src'));

                self.urls[index] = url.createObjectURL(blob);
                text = text.replace('#' + img.get('id'), self.urls[index]);
            });
            return text;
        },

        attachedImages: function (text, images) {
            var self = this,
                d = $.Deferred(),
                toDelete = [],
                pattern;

            if (images.length === 0) {
                d.resolve();
            }

            $.when(_.forEach(images.models, function (img, index) {
                pattern = new RegExp('#' + img.get('id'));
                if (pattern.test(text) === false) {
                    toDelete.push(img.get('id'));
                }
            })).done(function () {
                images.remove(toDelete);
                d.resolve();
            });

            return d;
        },

        clean: function () {
            var url = window.URL || window.webkitURL;

            _.forEach(this.urls, function (urlImage) {
                url.revokeObjectURL(urlImage);
            });
        }

    });

    return Images;
});
