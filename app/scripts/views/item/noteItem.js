/*global define*/
/*global Markdown*/
define([
    'underscore',
    'backbone',
    'marionette',
    'text!noteItemTempl',
    'checklist',
    'prettify',
    'backbone.mousetrap',
    'pagedown-extra'
], function (_, Backbone, Marionette, Template, Checklist, prettify) {
    'use strict';

    // Intergrating backbone.mousetrap in marionette
    _.extend(Marionette.ItemView, Backbone.View);

    var View = Marionette.ItemView.extend({
        template: _.template(Template),

        className: 'content-notes',

        ui: {
            editBtn: '.btn-edit',
            favorite: '.favorite span',
            progress: '.progress-bar',
            percent : '.progress-percent'
        },

        events: {
            'click .favorite': 'favorite',
            'click .task :checkbox': 'toggleTask',
            'click #showSettings'  : 'showSettings'
        },

        keyboardEvents: {
            'e': 'editNote',
            's': 'favorite',
            'shift+3': 'deleteNote'
        },

        initialize: function() {
            // this.model.on('change', this.render);
            this.model.trigger('shown');
            this.listenTo(this.model, 'change', this.changeFocus);
            this.listenTo(this.model, 'change:isFavorite', this.changeFavorite);

            document.title = this.model.get('title');
        },

        onRender: function () {
            // Google code prettify
            var code = null;
            this.$('pre').addClass('prettyprint').each(function (idx, el) {
                code = el.firstChild;
                code.innerHTML = prettify.prettyPrintOne(code.innerHTML);
            });

            // Make table look good
            this.$('table').addClass('table table-bordered');
        },

        changeFocus: function() {
            this.model.trigger('shown');
        },

        changeFavorite: function () {
            if (this.model.get('isFavorite') === 1) {
                this.ui.favorite.removeClass('glyphicon-star-empty');
            } else {
                this.ui.favorite.addClass('glyphicon-star-empty');
            }
        },

        /**
         * Add note item to your favorite notes list
         */
        favorite: function () {
            var isFavorite = (this.model.get('isFavorite') === 1) ? 0 : 1;
            this.model.save({'isFavorite': isFavorite});
            return false;
        },

        /**
         * Redirect to edit page
         */
        editNote: function () {
            var uri = this.ui.editBtn.attr('href');
            Backbone.history.navigate(uri);
        },

        /**
         * Redirect to deleting page
         */
        deleteNote: function() {
            Backbone.history.navigate('/note/remove/' + this.model.get('id'), true);
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

            // Status in progress bar
            var percent = Math.floor(this.model.get('taskCompleted') * 100 / this.model.get('taskAll'));
            this.ui.progress.css({width: percent + '%'});
            this.ui.percent.html(percent + '%');
        },

        showSettings: function (e) {
            e.preventDefault();
            this.options.app.execute('show settings');
        },

        templateHelpers: function() {
            return {
                getProgress: function(taskCompleted, taskAll) {
                    return Math.floor(taskCompleted * 100 / taskAll);
                },

                getContent: function(text) {
                    text = new Checklist().toHtml(text);
                    // var converter = Markdown.getSanitizingConverter();
                    var converter = new Markdown.Converter();
                    Markdown.Extra.init(converter);
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
