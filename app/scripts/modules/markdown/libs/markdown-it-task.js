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
], function(_) {
    'use strict';

    /**
     * Tasks plugin for Markdown-it.
     */
    function taskReplace(md) {
        var pattern        = /\[(X|\s|\_|\-)?\]\s(.*)/i,
            lastId         = 0,
            arrayReplaceAt = md.utils.arrayReplaceAt;

        /**
         * Replace elements with checkboxes.
         */
        function replaceToken(original, Token) {
            var matches = original.content.match(pattern),
                value   = matches[1],
                label   = matches[2],
                checked = (value === 'X' || value === 'x'),
                token;

            // Create a new token
            token = new Token('task_tag', '', 0);
            token.meta = {
                id      : lastId,
                label   : label,
                checked : checked
            };
            token.children = [];
            lastId++;

            return [token];
        }

        return function(state) {

            // Go through tokens and continue if the block is inline
            _.each(state.tokens, function(token) {
                if (token.type !== 'inline') {
                    return;
                }

                // Find children which match the pattern
                _.each(token.children, function(child, i) {
                    if (child.type === 'text' && pattern.test(child.content)) {
                        token.children = arrayReplaceAt(token.children, i, replaceToken(child, state.Token));
                    }
                });
            });
        };
    }

    return function(md) {
        md.core.ruler.push('task', taskReplace(md));

        md.renderer.rules.task_tag = function(tokens, id, f, env) { // jshint ignore:line
            var m = tokens[id].meta;

            if (env) {
                env.tasks = env.tasks || [];
                env.tasks.push(m.label);

                if (m.checked) {
                    env.taskCompleted = (env.taskCompleted || 0) + 1;
                }
            }

            return '<label class="task task--checkbox">' +
                '<input data-task="' + m.id + '" type="checkbox"' + (m.checked ? 'checked="checked"' : '') + ' class="checkbox--input" />' +
                '<svg class="checkbox--svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
                    '<path class="checkbox--path" d="M16.667,62.167c3.109,5.55,7.217,10.591,10.926,15.75 c2.614,3.636,5.149,7.519,8.161,10.853c-0.046-0.051,1.959,2.414,2.692,2.343c0.895-0.088,6.958-8.511,6.014-7.3 c5.997-7.695,11.68-15.463,16.931-23.696c6.393-10.025,12.235-20.373,18.104-30.707C82.004,24.988,84.802,20.601,87,16"></path>' +
                '</svg>' +
                '<span class="checkbox--text">' + m.label + '</span></label>';
        };
    };
});
