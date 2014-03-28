/**
 * Replaces MD code like ![](#image-id) to ![](base64://image-code)
 */
define(['underscore', 'toBlob'], function (_, toBlob) {
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

        clean: function () {
            var url = window.URL || window.webkitURL;

            _.forEach(this.urls, function (urlImage) {
                url.revokeObjectURL(urlImage);
            });
        }

    });

    return Images;
});
