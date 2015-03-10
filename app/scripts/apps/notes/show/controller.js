/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'apps/notes/show/noteView'
], function(_, Marionette, Radio, View) {
    'use strict';

    /**
     * The controller that shows a note.
     *
     * Triggers the following:
     * Events:
     * 1. channel: `appNote`, event: `model:active`
     * Request:
     * 1. channel: editor, request: task:toggle
     * Command:
     * 1. channel: notes, command: save
     */
    var Controller = Marionette.Controller.extend({

        initialize: function(options) {
            _.bindAll(this, '_show');
            this.options = options;

            // Fetch the note by ID
            Radio.request('notes', 'getById', options.id)
            .then(this._show);
        },

        onDestroy: function() {
            this.view.off('toggle:task');
            this.view.trigger('destroy');
        },

        _show: function(note) {
            // Trigger an event that the model is active
            Radio.trigger('appNote', 'model:active', note);

            this.view = new View({
                model: note,
                args : this.options,
                files : [],
            });

            // Show the view in the `content` region
            Radio.command('global', 'region:show', 'content', this.view);

            // Events
            this.view.on('toggle:task', this.toggleTask, this);
        },

        /**
         * Tries to get new content with toggled task.
         * It is expected that such editor modules as Pagedown
         * replies to the request `task:toggle` and returns an object with
         * counts of completed tasks and content with toggled task.
         */
        toggleTask: function(taskId) {
            var model = this.view.model,

                // Request the content with toggled task.
                task = Radio.request('editor', 'task:toggle', {
                    content : model.get('content'),
                    taskId  : taskId
                });

            // No reply
            if (!task) {
                return;
            }

            // Save the note
            Radio.command('notes', 'save', model, {
                content       : task.content,
                taskCompleted : task.completed
            });
        }
    });

    return Controller;
});
