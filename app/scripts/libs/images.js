/**
 * Replaces MD code like ![](#image-id) to ![](base64://image-code)
 */
define(['underscore'], function (_) {
    'use strict';

    var Images = function () { };

    _.extend(Images.prototype, {

        toHtml: function (text, images) {
            _.forEach(images, function (img) {
                text = text.replace('#' + img.get('id'), img.get('src'));
            });
            return text;
        }

    });

    return Images;
});
