/*global define*/
/*global Markdown*/
define([
    'underscore',
    'backbone',
    'marionette',
    'text!noteSidebarItemTempl',
    'sjcl',
    'pagedown-ace'
], function(_, Backbone, Marionette, Template) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Template),

        className: 'list-group',

        initialize: function () {
            this.configs = this.options.configs;
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'change:trash', this.remove);
            this.listenTo(this.model, 'active', this.changeFocus);
        },

        /**
         * Make note active
         */
        changeFocus: function () {
            $('.list-group-item.active').removeClass('active');
            this.$('.list-group-item').addClass('active');

            $('#sidebar .ui-s-content').scrollTop(
                this.$('.list-group-item').offset().top -
                $('#sidebar .ui-s-content').offset().top +
                $('#sidebar .ui-s-content').scrollTop() - 100
            );
        },

        serializeData: function () {
            var data = _.extend(this.model.decrypt(this.configs), {
                page    : this.options.page,
                url     : this.options.url
            });

            return data;
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
