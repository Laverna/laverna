/*global define*/
/*global Showdown*/
define(['underscore', 'marionette', 'text!noteSidebarItemTempl'],
function(_, Marionette, Template){
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
                    var converter = new Showdown.converter();
                    var content = converter.makeHtml(text);
                    content = content.substring(0, 50).replace(/<(?:.|\n)*?>/gm, '');
                    return content;
                },

                getTitle: function (title) {
                    return title.replace(/<(?:.|\n)*?>/gm, '');
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
