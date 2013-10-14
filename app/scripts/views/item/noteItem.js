/*global define */
define(['underscore', 'backbone', 'shortcutView', 'text!noteItemTempl', 'showdown', 'checklist', 'prettify'],
function (_, Backbone, ShortcutView, Template, Showdown, Checklist, prettify) {
    'use strict';

    var View = ShortcutView.ItemView.extend({
        template: _.template(Template),

        className: 'content-notes',

        ui: {
            editBtn: '.btn-edit'
        },

        events: {
            'click .favorite': 'favorite',
            'click .task :checkbox': 'toggleTask'
        },

        shortcuts: {
            69: 'editNote',
            70: 'favorite'
        },

        initialize: function() {
            this.model.on('change', this.render);
            this.listenTo(this.model, 'change', this.changeFocus);

            this.enableShortcut();
        },

        onBeforeClose: function () {
            this.disableShortcut();
        },

        onRender: function () {
            // Google code prettify
            var code = null;
            this.$('pre').addClass('prettyprint').each(function (idx, el) {
                code = el.firstChild;
                code.innerHTML = prettify.prettyPrintOne(code.innerHTML);
            });
        },

        changeFocus: function() {
            $('#sidebar #note-' + this.model.get('id')).addClass('active');
        },

        /**
         * Add note item to your favorite notes list
         */
        favorite: function (e) {
            if (e !== undefined) {
                e.preventDefault();
            }

            var isFavorite = (this.model.get('isFavorite') === 1) ? 0 : 1;
            this.model.save({'isFavorite': isFavorite});
        },

        editNote: function () {
            var uri = this.ui.editBtn.attr('href');
            Backbone.history.navigate(uri);
        },

        deleteNote: function() {
            console.log('event');
            // Backbone.history.navigate('/note/remove/' + this.model.get('id'), true);
        },

        /**
         * Toggle task status
         */
        toggleTask: function (e) {
            var task = $(e.target);
            var taskId = parseInt(task.attr('data-task'), null);
            var text = new Checklist().toggle(this.model.get('content'), taskId);

            // Save result
            this.model.set('content', text.content);
            this.model.set('taskCompleted', text.completed);
            this.model.save();
        },

        templateHelpers: function() {
            return {
                getProgress: function(taskCompleted, taskAll) {
                    return parseInt(taskCompleted * 100 / taskAll, null);
                },

                getContent: function(text) {
                    text = new Checklist().toHtml(text);
                    var converter = new Showdown.converter();
                    return converter.makeHtml(text);
                },

                // Generate link
                link: function (id, page, notebook) {
                    var url = '/note/show/';
                    notebook = (notebook === undefined) ? 0 : notebook;

                    if (page !== undefined) {
                        url += notebook + '/p' + page + '/show/';
                    }

                    return url + id;
                }
            };
        }
    });

    return View;
});
