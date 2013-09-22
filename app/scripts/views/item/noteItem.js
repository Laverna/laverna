/*global define */
define(['underscore', 'marionette', 'text!noteItemTempl', 'showdown', 'checklist', 'prettify'],
function (_, Marionette, Template, Showdown, Checklist, prettify) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Template),

        className: 'content-notes',

        events: {
            'click .favorite': 'favorite',
            'click .task :checkbox': 'toggleTask'
        },

        initialize: function() {
            this.model.on('change', this.render);
            this.listenTo(this.model, 'change', this.changeFocus);
            this.collection = this.collection.filter(function(model){
                return model.get('parentId') === this.model.get('id');
            }, this);
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
        favorite: function () {
            var isFavorite = (this.model.get('isFavorite') === 1) ? 0 : 1;
            this.model.save({'isFavorite': isFavorite});
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
            var data = this;
            return {
                getProgress: function(taskCompleted, taskAll) {
                    return parseInt(taskCompleted * 100 / taskAll, null);
                },
                getContent: function(text) {
                    text = new Checklist().toHtml(text);
                    var converter = new Showdown.converter();
                    return converter.makeHtml(text);
                },
                getChilds: function() {
                    return data.collection;
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
