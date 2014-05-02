/*global define*/
/*global Markdown*/
define([
    'underscore',
    'app',
    'backbone',
    'helpers/uri',
    'text!apps/notes/show/templates/item.html',
    'checklist',
    'tags',
    'libs/images',
    'prettify',
    'helpers/mathjax',
    'backbone.mousetrap',
    'marionette',
    'pagedown-extra'
], function (_, App, Backbone, URI, Template, Checklist, Tags, Img, prettify, mathjax) {
    'use strict';

    var View = Backbone.Marionette.ItemView.extend({
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
            // Google code prettify
            var code = null;
            this.$('pre').addClass('prettyprint').each(function (idx, el) {
                code = el.firstChild;
                code.innerHTML = prettify.prettyPrintOne(code.innerHTML);
            });

            // Make table look good
            this.$('table').addClass('table table-bordered');

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
            data.notebook = App.Encryption.API.decrypt(data.notebook);

            // Show title
            document.title = data.title;

            data.uri = URI.link('/');
            data.title = converter.makeHtml(data.title);

            return data;
        },

        restoreFromTrash: function (e) {
            e.preventDefault();
            this.model.save({'trash': 0});
            App.navigateBack();
        },

        changeFocus: function () {
            this.model.trigger('changeFocus');
        },

        changeFavorite: function () {
            var sidebar = $('#note-' + this.model.get('id') + ' .favorite');
            if (this.model.get('isFavorite') === 1) {
                this.ui.favorite.removeClass('icon-star-empty');
                sidebar.removeClass('icon-star-empty');
            } else {
                this.ui.favorite.addClass('icon-star-empty');
                sidebar.addClass('icon-star-empty');
            }
        },

        /**
         * Add note item to your favorite notes list
         */
        favorite: function () {
            var isFavorite = (this.model.get('isFavorite') === 1) ? 0 : 1;
            this.model.trigger('update:any');
            this.model.save({'isFavorite': isFavorite});
            return false;
        },

        /**
         * Redirect to edit page
         */
        editNote: function () {
            App.navigate(this.ui.editBtn.attr('href'), true);
        },

        /**
         * Redirect to deleting page
         */
        deleteNote: function() {
            App.navigate(URI.link('/notes/remove/' + this.model.get('id')), true);
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
            e.preventDefault();
            App.navigate('/notes/p1', {trigger: false});
            App.trigger('notes:toggle', this.options.args);
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
