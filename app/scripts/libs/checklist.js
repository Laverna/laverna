/*
 * Showdown extension
 * [] Task -> <label><input type="checkbox" />Task</label>
 * [*] Task -> <label><input type="checkbox" checked="checked" />Task</label>
 */
/*global define*/
define(['underscore'], function (_) {
    'use strict';

    var Checklist = function () {
    };

    _.extend(Checklist.prototype, {

        parse: function (text) {
            var pattern = /^([*-]) \[([ Xx])\]/mg;
            var count = 0;

            text = text.replace(pattern, function(match, prefix, marker) {
                var content = '', checked = '';

                if (count !== 0) {
                    content += '</span></label>';
                }

                if (marker !== ' ') {
                    checked = ' checked="checked"';
                }

                content += '<label class="task"><input type="checkbox"' + checked + ' /><span>';

                count ++;
                return content;
            });

            console.log(count);
            return text;
        }

    });

    return Checklist;
});
