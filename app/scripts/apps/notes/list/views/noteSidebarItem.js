/*global define*/
define([
    'underscore',
    'backbone.radio',
    'marionette',
    'text!apps/notes/list/templates/sidebarListItem.html',
], function(_, Radio, Marionette, Tmpl) {
    'use strict';

    /**
     * Sidebar item view.
     */
    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        className: 'list-group',

        ui: {
            favorite : '.favorite',
        },

        events: {
            'click @ui.favorite': 'toggleFavorite'
        },

        modelEvents: {
            'change'            : 'render',
            'change:trash'      : 'remove',
            'focus'             : 'onChangeFocus'
        },

        initialize: function() {
            this.options.args.page = this.model.collection.state.currentPage;
        },

        toggleFavorite: function() {
            Radio.command('notes', 'save', this.model, this.model.toggleFavorite());
            return false;
        },

        onChangeFocus: function() {
            var $listGroup = this.$('.list-group-item');

            $('.list-group-item.active').removeClass('active');
            $listGroup.addClass('active');

            this.trigger('scroll:top', $listGroup.offset().top);
        },

        serializeData: function() {
            // Decrypting
            return _.extend(this.model.decrypt(), {
                args    : this.options.args
            });
        },

        templateHelpers: function() {
            return {
                // Show only first 50 characters of the content
                getContent: function() {
                    var text = Radio.request('editor', 'content:html', this.content);
                    return text.replace(/<(?:.|\n)*?>/gm, '').substring(1, 50);
                },

                // Strip from HTML tags the title
                getTitle: function(title) {
                    return title.replace(/<(?:.|\n)*?>/gm, '');
                },

                // Generate link
                link: function() {
                    return Radio.request('global', 'uri:note', this.args, this);
                },

                isActive: function() {
                    return this.args.id === this.id ? 'active' : '';
                }
            };
        }

    });

    return View;
});
