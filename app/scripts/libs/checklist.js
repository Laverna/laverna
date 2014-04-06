/*
 * Checklist
 * [] Task -> <label><input type="checkbox" />Task</label>
 * [*] Task -> <label><input type="checkbox" checked="checked" />Task</label>
 */
/*global define*/
define(['underscore'], function (_) {
    'use strict';

    var Checklist = function () {
    };

    _.extend(Checklist.prototype, {
        pattern: /\[([ Xx])\]/mg,

        /**
         * Count checkboxes
         */
        count: function (text) {
            if ( ! this.countTasks) {
                this.parse(text);
            }

            return {
                all       : this.countTasks,
                completed : this.completed
            };
        },

        /**
         * Toggle task completed status
         */
        toggle: function (text, index) {
            var newMarker;
            text = this.parse(text, function (match, marker, count) {
                if (count === index) {
                    marker = (marker === ' ') ? 'x' : ' ';
                    newMarker = marker;
                }
                return '[' + marker + ']';
            });

            this.completed = (newMarker === 'x') ? this.completed + 1 : this.completed - 1;

            return {
                content: text,
                completed: this.completed
            };
        },

        /**
         * [] - to html checkboxes
         */
        toHtml: function (text) {
            return this.parse(text, function (match, marker, count) {
                var content = '', checked = '';

                if (count !== 0) {
                    content += '</span></label>';
                }

                if (marker !== ' ') {
                    checked = ' checked="checked"';
                }

                content += '<label class="task"><input data-task="' + count + '" type="checkbox"' + checked + ' /><span>';

                return content;
            });
        },

        /**
         * Regex parsing here
         */
        parse: function (text, callback) {
            var count = 0, completed = 0;

            text = text.replace(this.pattern, function(match, marker) {
                var content = '';

                if (callback) {
                    content += callback(match, marker, count);
                } else {
                    content = match;
                }

                if (marker !== ' ') {
                    completed ++;
                }

                count ++;
                return content;
            });

            this.countTasks = count;
            this.completed = completed;

            return text;
        }

    });

    return Checklist;
});
