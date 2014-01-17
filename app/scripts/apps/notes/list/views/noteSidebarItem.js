/*global define*/
/*global Markdown*/
define([
    'underscore',
    'app',
    'backbone',
    'marionette',
    'text!apps/notes/list/templates/sidebarListItem.html',
    'pagedown-ace',
    'pagedown.sanitizer'
], function(_, App, Backbone, Marionette, Template) {
    'use strict';

    var View = Backbone.Marionette.ItemView.extend({
        template: _.template(Template),

        className: 'list-group',

        ui: {
            favorite : '.favorite',
        },

        keyboardEvents: {
        },

        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'change:trash', this.remove);
            this.listenTo(this.model, 'changeFocus', this.changeFocus);
        },

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
            var data = this.model.toJSON();

            // Decrypting
            data.title = App.Encryption.API.decrypt(data.title);
            data.content = App.Encryption.API.decrypt(data.content);

            return _.extend(data, {
                args    : this.options.args
            });
        },

        templateHelpers: function () {
            return {
                getContent: function (text) {
                    // Pagedown
                    //var pagedown = new Markdown.Converter();
                    var safeConverter = Markdown.getSanitizingConverter();
                    var content = safeConverter.makeHtml(text);
                    content = content.replace(/<(?:.|\n)*?>/gm, '').substring(0, 50);

                    return content;
                },

                getTitle: function (title) {
                    return title.replace(/<(?:.|\n)*?>/gm, '');
                },

                // Generate link
                link: function () {
                    var url = '/notes';
                    if (this.args.filter !== null) {
                        url += '/f/' + this.args.filter;
                    }
                    if (this.args.query) {
                        url += '/q/' + this.args.query;
                    }
                    if (this.args.page) {
                        url += '/p' + this.args.page;
                    }
                    return url + '/show/' + this.id;
                }
            };
        }

    });

    return View;
});
