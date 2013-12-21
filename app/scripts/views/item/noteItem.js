/*global define*/
/*global Markdown*/
/*global sjcl*/
define([
    'underscore',
    'backbone',
    'marionette',
    'text!noteItemTempl',
    'checklist',
    'prettify',
    'sjcl',
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
            editBtn  : '.btn-edit',
            favorite : '.favorite span',
            progress : '.progress-bar',
            percent  : '.progress-percent'
        },

        events: {
            'click .favorite'  : 'favorite',
            'click .task [type="checkbox"]': 'toggleTask'
        },

        keyboardEvents: {
        },

        initialize: function() {
            // Setting shortcuts
            var configs = this.options.configs;
            this.keyboardEvents[configs.actionsEdit] = 'editNote';
            this.keyboardEvents[configs.actionsRotateStar] = 'favorite';
            this.keyboardEvents[configs.actionsRemove] = 'deleteNote';
            this.keyboardEvents.up = 'scrollTop';
            this.keyboardEvents.down = 'scrollDown';

            this.listenTo(this.model, 'change', this.changeFocus);
            this.listenTo(this.model, 'change:isFavorite', this.changeFavorite);
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

        afterRender: function () {
            this.$('.ui-s-content').trigger('click');
        },

        /**
         * Decrypt content and title
         */
        serializeData: function () {
            // Decrypting
            var data = this.model.toJSON(),
                configs = this.options.configs;

            // Decrypting
            if (configs.encrypt === 1) {
                data.title   = sjcl.decrypt(configs.secureKey, data.title);
                data.content = sjcl.decrypt(configs.secureKey, data.content);
            }

            // Show title
            document.title = data.title;
            return data;
        },

        changeFocus: function () {
            this.model.trigger('changeFocus');
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
            var task = $(e.target),
                taskId = parseInt(task.attr('data-task'), null),
                text = new Checklist().toggle(this.model.get('content'), taskId);

            // Save result
            this.model.set('content', text.content);
            this.model.set('taskCompleted', text.completed);
            this.model.save();

            // Status in progress bar
            var percent = Math.floor(this.model.get('taskCompleted') * 100 / this.model.get('taskAll'));
            this.ui.progress.css({width: percent + '%'});
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
