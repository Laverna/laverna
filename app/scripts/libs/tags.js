/**
 * Tags helper
 * @tagName -> <a href="#/notes/f/tag/q/tagName">@tagName</a>
 */
/*global define*/
define(['underscore'], function (_) {
    'use strict';

    var Tags = function () {
    };

    _.extend(Tags.prototype, {
        pattern: /(^|[^@\w])@(\w{1,250})\b/g,

        getTags: function (text) {
            if (this.tags === undefined) {
                this.parse(text);
            }
            return this.tags;
        },

        /**
         * @tagName - to link
         */
        toHtml: function (text) {
            return this.parse(text, function (match, leadingSlash, tagName) {
                if (leadingSlash === '\\') {
                    return match;
                } else {
                    return ' <a class="label label-default" href="#/notes/f/tag/q/' + tagName + '">@' + tagName + '</a>';
                }
            });
        },

        parse: function (text, callback) {
            var tags = [],
                content;

            text = text.replace(this.pattern, function(match, leadingSlash, tagName) {
                content = '';
                if (callback) {
                    content += callback(match, leadingSlash, tagName);
                } else {
                    content = match;
                }
                // tags.push(tagName);
                tags = _.union([tagName], tags); // No duplicates
                return content;
            });

            this.tags = tags;
            return text;
        }

    });

    return Tags;
});
