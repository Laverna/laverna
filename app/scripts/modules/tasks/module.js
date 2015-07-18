/* global define */
define([
    'underscore',
    'backbone.radio'
], function(_, Radio) {
    'use strict';

    /**
     * Task module.
     *
     * Searches paragraphs which begin with [X?] and transforms them into checklists.
     *
     * Replies to requests on channel `editor`:
     * 1. `get:tasks` - searches provided text for tasks and returns them.
     *
     * Listens to events:
     * 1. channel: `editor`, event: `converter:init`
     *    adds custom hooks.
     */
    var Tasks = {
        regex: /\[([ x])?\] ?(.+)$/mgi,

        replaceTasks: function(text) {
            var count = 0,
                checked;

            return text.replace(this.regex, function(match, status, task) {
                // Pseudo ID of the task
                count++;

                if (status === 'x' || status === 'X') {
                    checked = ' checked="checked"';
                }
                else {
                    checked = '';
                }

                return '<label class="task checkbox"><input data-task="' + count +
                    '" type="checkbox"' + checked + ' class="checkbox--input" />' +
                    '<svg class="checkbox--svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
                    '<path class="checkbox--path" d="M16.667,62.167c3.109,5.55,7.217,10.591,10.926,15.75 c2.614,3.636,5.149,7.519,8.161,10.853c-0.046-0.051,1.959,2.414,2.692,2.343c0.895-0.088,6.958-8.511,6.014-7.3 c5.997-7.695,11.68-15.463,16.931-23.696c6.393-10.025,12.235-20.373,18.104-30.707C82.004,24.988,84.802,20.601,87,16"></path>' +
                    '</svg>' +
                    '<span class="checkbox--text">' + task + '</span></label>';
            });
        },

        /**
         * @return object
         */
        getTasks: function(text) {
            var result = {
                    taskAll       : 0,
                    taskCompleted : 0,
                    tasks         : []
                },
                isActive,
                myArr;

            while ((myArr = this.regex.exec(text)) !== null) {
                isActive = (myArr[1] === 'x' || myArr[1] === 'X') === false;

                result.tasks.push({isActive: isActive, name: myArr[2]});
                result.taskAll++;

                if (!isActive) {
                    result.taskCompleted++;
                }
            }

            return result;
        },

        /**
         * Toggle active status of a task
         */
        toggle: function(data) {
            var count  = 0,
                result = {completed: 0},
                isComplete,
                newStat;

            result.content = data.content.replace(this.regex, function(match, status) {
                count++;

                isComplete = (status === 'x' || status === 'X');

                if (count !== data.taskId) {
                    result.completed = result.completed + (isComplete ? 1 : 0);
                    return match;
                }

                // If it is active, unnactivate it
                newStat = isComplete ? ' ' : 'x';
                result.completed = result.completed + (isComplete ? 0 : 1);

                return match.replace('[' + status + ']', '[' + newStat + ']');
            });

            return result;
        },

        /**
         * Add hooks to Pagedown editor
         */
        addHook: function(converter) {
            converter.hooks.chain('postConversion', function(text) {
                return Tasks.replaceTasks(text);
            });
        }
    };

    Radio.command('init', 'add', 'module', function() {
        // Parses text for tasks
        Radio.reply('editor', 'get:tasks', Tasks.getTasks, Tasks);

        // Toggle the status of a task in a Markdown text
        Radio.reply('editor', 'task:toggle', Tasks.toggle, Tasks);

        // When editor converter is initialized, add hooks
        Radio.on('editor', 'converter:init', Tasks.addHook, Tasks);
    });

    return Tasks;

});
