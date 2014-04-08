/*global define*/
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
                pattern,
                src;

            this.urls = [];

            images.forEach(function (img, index) {
                src = img.get('src');
                src = (typeof src === 'object') ? src : toBlob(src);

                self.urls[index] = url.createObjectURL(src);
                pattern = new RegExp('#' + img.get('id'));
                text = text.replace(pattern, self.urls[index]);
            });
            return text;
        },

        attachedImages: function (text, images) {
            var d = $.Deferred(),
                toDelete = [],
                pattern;

            if (images.length === 0) {
                d.resolve();
            }

            $.when(_.forEach(images.models, function (img) {
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
