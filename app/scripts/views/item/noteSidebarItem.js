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
            this.listenTo(this.model,  'change', this.render);
            this.listenTo(this.model,  'change:trash', this.remove);
        },

        serializeData: function () {
            return _.extend(this.model.toJSON(), {
                page          : this.options.page,
                shownNotebook : this.shownNotebook
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
                link: function (id, page, notebook) {
                    var url = '/note/';
                    notebook = (notebook === undefined) ? 0 : notebook;

                    if (page !== undefined) {
                        url += notebook + '/p' + page + '/show/';
                    } else {
                        url += 'show/';
                    }

                    return url + id;
                }
            };
        }

    });

    return View;
});
