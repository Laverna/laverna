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

        events: {
            'click @ui.favorite': 'favorite'
        },

        modelEvents: {
            'change'       : 'render',
            'change:trash' : 'remove',
            'changeFocus'  : 'changeFocus',
            'change:isFavorite': 'changeFavorite'
        },

        initialize: function () {
        },

        changeFavorite: function () {
            var content = $('.article[data-id="' + this.model.get('id') + '"] .favorite span');
            if (this.model.get('isFavorite') === 1) {
                content.removeClass('icon-star-empty');
            } else {
                content.addClass('icon-star-empty');
            }
        },

        favorite: function () {
            this.model.trigger('setFavorite');
            return false;
        },

        changeFocus: function () {
            var $sidebar = $('#sidebar .ui-body'),
                $listGroup = this.$('.list-group-item');

            $('.list-group-item.active').removeClass('active');
            $listGroup.addClass('active');

            if ($sidebar && $sidebar.offset()) {
                $sidebar.scrollTop(
                    $listGroup.offset().top -
                    $sidebar.offset().top +
                    $sidebar.scrollTop() - 100
                );
            }
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
