/*global define*/
/*global Markdown*/
define([
    'underscore',
    'backbone',
    'marionette',
    'text!noteSidebarItemTempl',
    'pagedown-ace'
], function(_, Backbone, Marionette, Template) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Template),

        className: 'list-group',

        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'change:trash', this.remove);
            this.listenTo(this.model, 'shown', this.changeFocus);

            switch (this.options.filter) {
                case 'favorite':
                    this.url = '#/note/favorite/';
                    break;
                case 'trashed':
                    this.url = '#/note/trashed/';
                    break;
                case 'search':
                    this.url = '#/note/search/' + this.options.searchQuery;
                    break;
                default:
                    this.url = '#/note/' + this.options.notebookId;
                    break;
            }
        },

        changeFocus: function () {
            this.$('.list-group-item').addClass('active');
        },

        serializeData: function () {
            return _.extend(this.model.toJSON(), {
                page          : this.options.page,
                shownNotebook : this.options.notebookId,
                filter        : this.options.filter,
                url           : this.url
            });
        },

        templateHelpers: function () {
            return {
                getContent: function (text) {
                    // Pagedown
                    var converter = new Markdown.Converter();
                    // var safeConverter = pagedown.getSanitizingConverter();
                    var content = converter.makeHtml(text);
                    content = content.substring(0, 50).replace(/<(?:.|\n)*?>/gm, '');
                    return content;
                },

                getTitle: function (title) {
                    return title.replace(/<(?:.|\n)*?>/gm, '');
                },

                // Generate link
                link: function (id, page, url) {
                    return url + '/p' + page + '/show/' + id;
                }
            };
        }

    });

    return View;
});
