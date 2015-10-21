/* global define */
define([
    'underscore',
    'jquery',
    'marionette',
    'backbone.radio',
    'behaviors/content',
    'text!apps/notes/show/templates/item.html',
    'mousetrap'
], function(_, $, Marionette, Radio, Behavior, Tmpl, Mousetrap) {
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

        className: 'layout--body',

        behaviors: {
            ContentBehavior: {
                behaviorClass: Behavior
            }
        },

        ui: {
            favorite : '.btn--favourite--icon',
            body     : '.-scroll',

            // Tasks
            tasks    : '.task [type="checkbox"]',
            progress : '.progress-bar',
            percent  : '.progress-percent',

            // Action buttons
            editBtn  : '.note--edit',
            rmBtn    : '.note--remove'
        },

        events: {
            'click .btn--favourite' : 'favorite',
            'click @ui.tasks'       : 'toggleTask',
            'click @ui.rmBtn'       : 'rmNote'
        },

        triggers: {
            'click .note--restore' : 'model:restore'
        },

        modelEvents: {
            'change:trash'         : 'render',
            'change:isFavorite'    : 'onChangeFavorite',
            'change:taskCompleted' : 'onTaskCompleted'
        },

        initialize: function() {
            _.bindAll(this, 'scrollTop', 'scrollDown', 'editNote', 'rmNote', 'favorite');

            this.configs = Radio.request('configs', 'get:object');

            Mousetrap.bind('up', this.scrollTop);
            Mousetrap.bind('down', this.scrollDown);
            Mousetrap.bind(this.configs.actionsEdit, this.editNote);
            Mousetrap.bind(this.configs.actionsRemove, this.rmNote);
            Mousetrap.bind(this.configs.actionsRotateStar, this.favorite);
        },

        onRender: function() {
            Radio.trigger('noteView', 'view:render', this);
        },

        onBeforeDestroy: function() {
            Mousetrap.unbind(['up', 'down', this.configs.actionsEdit, this.configs.actionsRemove, this.configs.actionsRotateStar]);
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
            Radio.request('uri', 'navigate', this.ui.editBtn.attr('href'));
        },

        rmNote: function() {
            this.trigger('model:remove');
            return false;
        },

        /**
         * Changes favorite status of the note
         */
        favorite: _.throttle(function() {
            Radio.request('notes', 'save', this.model, this.model.toggleFavorite());
            return false;
        }, 300, {leading: false}),

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
