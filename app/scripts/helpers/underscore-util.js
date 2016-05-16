/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'underscore',
    'xss'
], function(_, cleanXSS) {
    'use strict';

    /**
     * Add some helper functions to Underscore.
     */
    _.mixin({

        /**
         * Sanitize HTML to prevent XSS.
         *
         * @type string str
         * @type boolean unescape
         * @type boolean stripTags
         */
        cleanXSS: function(str, unescape, stripTags) {

            /* Unescape the string 2 times because
             * data from Dropbox is always escaped + we escape them too.
             */
            if (unescape === true) {
                str = _.runTimes(_.unescape, 2, str);
            }

            // Remove all HTML tags
            if (stripTags === true) {
                str = _.stripTags(str);
            }

            return cleanXSS(str);
        },

        /**
         * Invokes the given function n times and returns the last result.
         * Example:
         * _.runTimes(_.unescape, 2, 'String');
         *
         * @type function func
         * @type number n
         */
        runTimes: function(func, n) {
            var args = Array.prototype.slice.call(arguments, 2),
                res;

            res = _.times(n, function() {
                return func.apply(null, args);
            });

            return res[res.length - 1];
        },

        /**
         * Remove all HTML from string.
         *
         * @type string str
         */
        stripTags: function(str) {
            return str.replace(/<\/?[^>]+>/g, '');
        },

    });

    return _;
});
