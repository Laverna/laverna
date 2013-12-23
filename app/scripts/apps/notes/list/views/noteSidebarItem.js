/*global define*/
/*global Markdown*/
// /*global sjcl*/
define([
    'underscore',
    'app',
    'backbone',
    'marionette',
    'text!apps/notes/list/templates/sidebarListItem.html',
    'sjcl',
    'pagedown-ace'
], function(_, App, Backbone, Marionette, Template) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Template),

        className: 'list-group',

        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
            this.listenTo(this.model, 'change:trash', this.remove);
            this.listenTo(this.model, 'changeFocus', this.changeFocus);
        },

        changeFocus: function () {
            $('.list-group-item.active').removeClass('active');
            this.$('.list-group-item').addClass('active');

            // $('#sidebar .ui-s-content').scrollTop(
            //     this.$('.list-group-item').offset().top -
            //     $('#sidebar .ui-s-content').offset().top +
            //     $('#sidebar .ui-s-content').scrollTop() - 100
            // );
        },

        serializeData: function () {
            var configs = this.options.configs,
                data = this.model.decrypt(configs);

            return _.extend(data, {
                args    : this.options.args,
                page    : this.options.page,
                url     : this.options.url
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
                link: function () {
                    var url = '/notes';
                    if (this.args.filter !== null) {
                        url += '/f/' + this.args.filter;
                    }
                    if (this.args.page !== null) {
                        url += '/page' + this.args.page;
                    }
                    return url + '/show/' + this.id;
                }
            };
        }

    });

    return View;
});
