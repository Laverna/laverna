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
    'marionette',
    'backbone.radio',
    'behaviors/sidebar',
    'apps/notes/list/views/noteSidebarItem',
    'text!apps/notes/list/templates/sidebarList.html',
    'mousetrap'
], function(_, Marionette, Radio, Behavior, NoteSidebarItem, Tmpl, Mousetrap) {
    'use strict';

    /**
     * Sidebar composite view.
     *
     * Listens to
     * -----------
     * Events:
     * 1. channel: `notes`, event: `model:navigate`
     *    Makes the provided model active.
     */
    var View = Marionette.CompositeView.extend({
        template           :  _.template(Tmpl),

        childView          :  NoteSidebarItem,
        childViewContainer :  '.list',
        childViewOptions   :  {},

        behaviors: {
            SidebarBehavior: {
                behaviorClass: Behavior
            }
        },

        ui: {
            pageNav  : '#pageNav',
            prevPage : '#prevPage',
            nextPage : '#nextPage'
        },

        events: {
            'click @ui.nextPage': 'nextPage',
            'click @ui.prevPage': 'previousPage'
        },

        collectionEvents: {
            'page:next'     : 'nextPage',
            'page:previous' : 'previousPage',
            'reset'         : 'updatePagination'
        },

        childEvents: {
            'scroll:top': 'changeScrollTop'
        },

        initialize: function() {
            _.bindAll(this, 'toNextNote', 'toPreviousNote');

            this.$scroll  = $('#sidebar .-scroll');
            this.configs = Radio.request('configs', 'get:object');

            // Shortcuts
            Mousetrap.bind(this.configs.navigateBottom, this.toNextNote);
            Mousetrap.bind(this.configs.navigateTop, this.toPreviousNote);

            // Events
            this.listenTo(Radio.channel('notes'), 'model:navigate', this.modelFocus, this);

            // Pass options to childView
            this.childViewOptions.args = this.options.args;
        },

        onDestroy: function() {
            Mousetrap.unbind([this.configs.navigateBottom, this.configs.navigateTop]);
        },

        onBeforeRender: function() {
            this.options.args = Radio.request('appNote', 'route:args') || this.options.args;
            this.childViewOptions.args = this.options.args;
        },

        /**
         * Makes the provided model active.
         */
        modelFocus: _.debounce(function(model) {
            this.options.args.id = model.id;
            model.trigger('focus');
        }, 10),

        toNextNote: function() {
            this.collection.getNextItem(this.options.args.id);
            return false;
        },

        toPreviousNote: function() {
            this.collection.getPreviousItem(this.options.args.id);
            return false;
        },

        /**
         * Updates pagination buttons
         */
        updatePagination: function() {
            this.ui.pageNav.toggleClass('hidden', this.collection.state.totalPages <= 1);
            this.ui.prevPage.toggleClass('disabled', !this.collection.hasPreviousPage());
            this.ui.nextPage.toggleClass('disabled', !this.collection.hasNextPage());
        },

        /**
         * Gets next page's models and resets the collection
         */
        nextPage: function() {
            if (this.ui.nextPage.hasClass('disabled')) {
                return false;
            }

            this.navigatePage(1);
            this.collection.getNextPage();
        },

        /**
         * Gets previous page's models and resets the collection
         */
        previousPage: function() {
            if (this.ui.prevPage.hasClass('disabled')) {
                return false;
            }

            this.navigatePage(-1);
            this.collection.getPreviousPage();
        },

        /**
         * Saves page status in window.location
         */
        navigatePage: function(number) {
            this.options.args.page = this.collection.state.currentPage + number;

            Radio.request(
                'uri', 'navigate',
                {options: this.options.args}, {trigger: false}
            );
        },

        /**
         * Changes scroll position.
         */
        changeScrollTop: function(view, scrollTop) {
            this.$scroll.scrollTop(
                scrollTop -
                this.$scroll.offset().top +
                this.$scroll.scrollTop() - 100
            );
        },

        serializeData: function() {
            var viewData = {
                collection  : this.collection,
                args        : this.options.args
            };
            return viewData;
        }

    });

    return View;
});
