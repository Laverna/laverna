/*global define*/
/*global Markdown*/
define([
    'underscore',
    'app',
    'marionette',
    'text!apps/notes/show/templates/item.html',
    'checklist',
    'tags',
    'libs/images',
    'prettify',
    'helpers/mathjax',
    'hammerjs',
    'backbone.mousetrap',
    'pagedown-extra'
], function (_, App, Marionette, Template, Checklist, Tags, Img, prettify, mathjax, Hammer) {
    'use strict';

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
            'click #restoreNote'  : 'restoreFromTrash',
            'click .favorite'  : 'favorite',
            'click .task [type="checkbox"]': 'toggleTask',
            'click .btn-toggle-sidebar': 'toggleSidebar'
        },

        keyboardEvents: {
            'up'   : 'scrollTop',
            'down' : 'scrollDown'
        },

        initialize: function() {
            this.imgHelper = new Img();

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
            var self = this,
                code = null;

            // Google code prettify
            this.$('pre').addClass('prettyprint').each(function (idx, el) {
                code = el.firstChild;
                code.innerHTML = prettify.prettyPrintOne(code.innerHTML);
            });

            // Make table look good
            this.$('table').addClass('table table-bordered');

            this.hammertime = new Hammer(this.el);
            this.hammertime.on('swiperight', function (e) {
                self.toggleSidebar();
                e.preventDefault();
            });

            // MathJax
            mathjax.init(this.el);
        },

        onClose: function () {
            this.imgHelper.clean();
        },

        /**
         * Decrypt content and title
         */
        serializeData: function () {
            var data = _.extend(this.model.toJSON(), this.options.decrypted),
                self = this,
                converter;

            // Convert from markdown to HTML
            // converter = Markdown.getSanitizingConverter();
            converter = new Markdown.Converter();
            Markdown.Extra.init(converter);

            // Customize markdown converter
            converter.hooks.chain('postNormalization', function (text) {
                text = new Checklist().toHtml(text);
                text = new Tags().toHtml(text);
                return self.imgHelper.toHtml(text, self.options.files);
            });

            data.content = converter.makeHtml(data.content);
            data.uri = App.request('uri:link', '/');
            data.title = converter.makeHtml(data.title);

            return data;
        },

        restoreFromTrash: function (e) {
            e.preventDefault();
            this.model.save({'trash': 0});
            App.vent.trigger('navigate:back');
        },

        changeFocus: function () {
            this.model.trigger('changeFocus');
        },

        changeFavorite: function () {
            if (this.model.get('isFavorite') === 1) {
                this.changeFavoriteClass('icon-favorite', 'icon-star-empty');
            } else {
                this.changeFavoriteClass('icon-star-empty', 'icon-favorite');
            }
        },

        changeFavoriteClass: function (addClass, removeClass) {
            var sidebar = $('#note-' + this.model.get('id') + ' .favorite');

            this.ui.favorite.removeClass(removeClass);
            sidebar.removeClass(removeClass);

            this.ui.favorite.addClass(addClass);
            sidebar.addClass(addClass);
        },

        /**
         * Add note item to your favorite notes list
         */
        favorite: function (e) {
            e.preventDefault();
            this.model.trigger('setFavorite');
            return false;
        },

        /**
         * Redirect to edit page
         */
        editNote: function () {
            App.vent.trigger('navigate:link', this.ui.editBtn.attr('href'));
        },

        /**
         * Redirect to deleting page
         */
        deleteNote: function() {
            App.vent.trigger('navigate:link', '/notes/remove' + this.model.get('id'));
        },

        /**
         * Toggle task status
         */
        toggleTask: function (e) {
            var task = $(e.target),
                taskId = parseInt(task.attr('data-task'), null),
                content = this.model.decrypt().content,
                text = new Checklist().toggle(content, taskId);

            // Save result
            this.model.trigger('updateTaskProgress', text);
        },

        /**
         * Shows percentage of completed tasks
         */
        taskProgress: function () {
            var percent = Math.floor(this.model.get('taskCompleted') * 100 / this.model.get('taskAll'));
            this.ui.progress.css({width: percent + '%'}, this.render, this);
            this.ui.percent.html(percent + '%');
        },

        /**
         * Scroll page to top when user hits up button
         */
        scrollTop: function () {
            var Top = this.$('.ui-body').scrollTop();
            this.$('.ui-body').scrollTop(Top - 50);
        },

        /**
         * Scroll page down when user hits down button
         */
        scrollDown: function () {
            var Top = this.$('.ui-body').scrollTop();
            this.$('.ui-body').scrollTop(Top + 50);
        },

        /**
         * Show sidebar
         */
        toggleSidebar: function (e) {
            if (e) {
                e.preventDefault();
            }

            if (this.$('.btn-toggle-sidebar').css('display') !== 'none') {
                App.vent.trigger('notes:link', '/notes/p1', false);
                App.trigger('notes:toggle', this.options.args);
            }
        },

        templateHelpers: function() {
            return {
                i18n: $.t,

                getProgress: function() {
                    return Math.floor(this.taskCompleted * 100 / this.taskAll);
                },

                getContent: function() {
                    return this.content;
                },

                createdDate: function() {
                    return new Date(this.created).toLocaleDateString();
                }
            };
        }

    });

    return View;
});
