/*global define*/
/*global Markdown*/
/*global sjcl*/
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
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'change:trash', this.remove);
            this.listenTo(this.model, 'shown', this.changeFocus);
        },

        changeFocus: function () {
            this.$('.list-group-item').addClass('active');
        },

        serializeData: function () {
            var data = _.extend(this.model.toJSON(), {
                page    : this.options.page,
                url     : this.options.url
            });

            // Decryption
            if (this.options.configs.get('encrypt').get('value') === 1) {
                data.content = sjcl.decrypt(this.options.key, data.content);
                data.title = sjcl.decrypt(this.options.key, data.title);
            }

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
