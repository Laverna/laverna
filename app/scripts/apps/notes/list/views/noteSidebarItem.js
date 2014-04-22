/*global define*/
/*global Markdown*/
define([
    'underscore',
    'app',
    'backbone',
    'marionette',
    'helpers/uri',
    'text!apps/notes/list/templates/sidebarListItem.html',
    'pagedown-ace'
    // 'pagedown.sanitizer'
], function(_, App, Backbone, Marionette, URI, Template) {
    'use strict';

    var View = Backbone.Marionette.ItemView.extend({
        template: _.template(Template),

        className: 'list-group',

        ui: {
            favorite : '.favorite',
        },

        keyboardEvents: {
        },

        modelEvents: {
            'change'       : 'render',
            'change:trash' : 'remove',
            'changeFocus'  : 'changeFocus'
        },

        initialize: function () {
        },

        changeFocus: function () {
            $('.list-group-item.active').removeClass('active');
            this.$('.list-group-item').addClass('active');

            $('#sidebar .ui-scroll-y').scrollTop(
                this.$('.list-group-item').offset().top -
                $('#sidebar .ui-scroll-y').offset().top +
                $('#sidebar .ui-scroll-y').scrollTop() - 100
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
                    // var converter = Markdown.getSanitizingConverter();
                    var converter = new Markdown.Converter();
                    var content = converter.makeHtml(text);
                    content = content.replace(/<(?:.|\n)*?>/gm, '').substring(0, 50);

                    return content;
                },

                getTitle: function (title) {
                    return title.replace(/<(?:.|\n)*?>/gm, '');
                },

                // Generate link
                link: function () {
                    return URI.note(this.args, this);
                }
            };
        }

    });

    return View;
});
