/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
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

        className: 'list-group list--group',

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
            Radio.request('notes', 'save', this.model, this.model.toggleFavorite());
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
            return _.extend(this.model.toJSON(), {
                args    : this.options.args
            });
        },

        templateHelpers: function() {
            return {
                // Show only first 50 characters of the content
                getContent: function() {
                    return _.unescape(this.content).substring(0, 50);
                },

                // Generate link
                link: function() {
                    return Radio.request('uri', 'link', this.args, this);
                },

                isActive: function() {
                    return this.args.id === this.id ? 'active' : '';
                }
            };
        }

    });

    return View;
});
