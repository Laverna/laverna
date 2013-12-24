/*global define*/
/*global Markdown*/
define([
    'underscore',
    'app',
    'backbone',
    'marionette',
    'text!apps/notes/show/templates/item.html',
    'checklist',
    'prettify',
    'sjcl',
    'backbone.mousetrap',
    'pagedown-extra'
], function (_, App, Backbone, Marionette, Template, Checklist, prettify) {
    'use strict';

    // Intergrating backbone.mousetrap in marionette
    _.extend(Marionette.ItemView, Backbone.View);

    var View = Marionette.ItemView.extend({
        template: _.template(Template),

        className: 'content-notes',

        ui: {
            editBtn  : '.btn-edit',
            favorite : '.favorite span',
            progress : '.progress-bar',
            percent  : '.progress-percent',
            notebook : '.notebook-name'
        },

        events: {
            'click .favorite'  : 'favorite',
            'click .task [type="checkbox"]': 'toggleTask'
        },

        keyboardEvents: {
            'up'   : 'scrollTop',
            'down' : 'scrollDown'
        },

        initialize: function() {
            // Setting shortcuts
            var configs = App.settings;
            this.keyboardEvents[configs.actionsEdit] = 'editNote';
            this.keyboardEvents[configs.actionsRotateStar] = 'favorite';
            this.keyboardEvents[configs.actionsRemove] = 'deleteNote';

            // Model events
            this.listenTo(this.model, 'change:isFavorite', this.changeFavorite);
            this.listenTo(this.model, 'change:taskCompleted', this.taskProgress, this);
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

        /**
         * Decrypt content and title
         */
        serializeData: function () {
            var data = _.extend(this.model.toJSON(), this.options.decrypted);

            // Show title
            document.title = data.title;
            return data;
        },

        changeFocus: function () {
            this.model.trigger('changeFocus');
        },

        changeFavorite: function () {
            var sidebar = $('#note-' + this.model.get('id') + ' .favorite');
            if (this.model.get('isFavorite') === 1) {
                this.ui.favorite.removeClass('glyphicon-star-empty');
                sidebar.removeClass('glyphicon-star-empty');
            } else {
                this.ui.favorite.addClass('glyphicon-star-empty');
                sidebar.addClass('glyphicon-star-empty');
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
            App.navigate(uri);
        },

        /**
         * Redirect to deleting page
         */
        deleteNote: function() {
            App.navigate('/note/remove/' + this.model.get('id'), true);
        },

        /**
         * Toggle task status
         */
        toggleTask: function (e) {
            var task = $(e.target),
                taskId = parseInt(task.attr('data-task'), null),
                content = App.Encryption.API.decrypt(this.model.get('content')),
                text = new Checklist().toggle(content, taskId);

            // Save result
            this.model.trigger('updateTaskProgress', text);
        },

        taskProgress: function () {
            // Status in progress bar
            var percent = Math.floor(this.model.get('taskCompleted') * 100 / this.model.get('taskAll'));
            this.ui.progress.css({width: percent + '%'}, this.render, this);
            this.ui.percent.html(percent + '%');
        },

        scrollTop: function () {
            var Top = this.$('.ui-s-content').scrollTop();
            this.$('.ui-s-content').scrollTop(Top - 50);
        },

        scrollDown: function () {
            var Top = this.$('.ui-s-content').scrollTop();
            this.$('.ui-s-content').scrollTop(Top + 50);
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
