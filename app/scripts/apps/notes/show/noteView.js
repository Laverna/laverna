/* global define */
define([
    'underscore',
    'jquery',
    'marionette',
    'backbone.radio',
    'text!apps/notes/show/templates/item.html',
    'backbone.mousetrap'
], function(_, $, Marionette, Radio, Tmpl) {
    'use strict';

    /**
     * Note view.
     *
     * Triggers the following
     * Events:
     * 1. channel: noteView, event: view:render
     *    when the view is rendered and ready.
     * 2. channel: noteView, event: view:destroy
     *    before the view is destroyed.
     * Requests:
     * 1. channel: editor, request: content:html
     *    it expects to receive HTML.
     * 2. channel: global, request: configs
     */
    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        className: 'content-notes',

        ui: {
            favorite : '.favorite span',
            body     : '.ui-body',

            // Tasks
            tasks    : '.task [type="checkbox"]',
            progress : '.progress-bar',
            percent  : '.progress-percent',

            // Action buttons
            editBtn  : '.btn-edit',
            rmBtn    : '.btn-remove'
        },

        events: {
            'click @ui.favorite' : 'favorite',
            'click @ui.tasks'    : 'toggleTask',
            'click @ui.rmBtn'    : 'rmNote'
        },

        triggers: {
            'click #restoreNote' : 'model:restore'
        },

        modelEvents: {
            'change:trash'         : 'render',
            'change:isFavorite'    : 'onChangeFavorite',
            'change:taskCompleted' : 'onTaskCompleted'
        },

        keyboardEvents: {
            /*
             * Scroll with up/down keys.
             * It is done to avoid an unexpected behaviour.
             */
            'up'   : 'scrollTop',
            'down' : 'scrollDown'
        },

        initialize: function() {
            var configs = Radio.request('configs', 'get:object');
            this.keyboardEvents[configs.actionsEdit]       = 'editNote';
            this.keyboardEvents[configs.actionsRemove]     = 'rmNote';
            this.keyboardEvents[configs.actionsRotateStar] = 'favorite';
        },

        onRender: function() {
            Radio.trigger('noteView', 'view:render', this);
        },

        onBeforeDestroy: function() {
            Radio.trigger('noteView', 'view:destroy');
        },

        scrollTop: function() {
            this.ui.body.scrollTop(this.ui.body.scrollTop() - 50);
            return false;
        },

        scrollDown: function() {
            this.ui.body.scrollTop(this.ui.body.scrollTop() + 50);
            return false;
        },

        editNote: function() {
            Radio.command('uri', 'navigate', this.ui.editBtn.attr('href'));
        },

        rmNote: function() {
            this.trigger('model:remove');
            return false;
        },

        /**
         * Changes favorite status of the note
         */
        favorite: _.debounce(function() {
            Radio.command('notes', 'save', this.model, this.model.toggleFavorite());
            return false;
        }, 200),

        onChangeFavorite: function() {
            this.ui.favorite.toggleClass('icon-favorite', this.model.get('isFavorite'));
        },

        /**
         * Toggle the status of a task
         */
        toggleTask: _.debounce(function(e) {
            var $task = $(e.target),
                taskId = Number($task.attr('data-task'));

            this.trigger('toggle:task', taskId);
        }, 300),

        /**
         * Update progress bar when the status of a task was changed
         */
        onTaskCompleted: function() {
            var percent = Math.floor(
                this.model.get('taskCompleted') * 100 / this.model.get('taskAll')
            );
            this.ui.progress.css({width: percent + '%'});
            this.ui.percent.html(percent + '%');
        },

        serializeData: function() {
            var content = Radio.request('editor', 'content:html', this.model);
            return _.extend(this.model.toJSON(), {
                content  : content || this.model.get('content'),
                notebook : this.options.notebook.toJSON(),
                uri      : Radio.request('uri', 'link:profile', '/')
            });
        },

        templateHelpers: function() {
            return {
                createdDate: function() {
                    return new Date(this.created).toLocaleDateString();
                },

                getProgress: function() {
                    return Math.floor(this.taskCompleted * 100 / this.taskAll);
                }
            };
        }
    });

    return View;

});
