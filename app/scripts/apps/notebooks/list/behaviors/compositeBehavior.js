/**
 * Copyright (C) 2015 Laverna project Authors.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio'
], function(_, Marionette, Radio) {
    'use strict';

    /**
     * Composite behavior class for notebooks and tags views.
     *
     * Triggers the following events:
     * 1. channel: `appNotebooks`, event: `change:region`
     *    when the user has reached the last or the first model
     */
    var CompositeBehavior = Marionette.Behavior.extend({

        defaults: {
            channel        : 'notebooks',
            regionToChange : 'tags',
            activeModel    : null
        },

        initialize: function() {
            this.collection = this.view.options.collection;
            this.uiBody = $('.-scroll');

            this.channel = Radio.channel(this.options.channel);

            // Listen to events on a channel [notebooks|tags]
            this.listenTo(this.channel, 'model:navigate', this.modelFocus);

            // View events
            this.listenTo(this.view, 'navigate:next', this.navigateNext);
            this.listenTo(this.view, 'navigate:previous', this.navigatePrevious);
            this.listenTo(this.view, 'childview:scroll:top', this.changeScrollTop);

            // Collection events
            this.listenTo(this.collection, 'page:end', this.onPageEnd);
            this.listenTo(this.collection, 'page:start', this.onPageStart);
        },

        onBeforeDestroy: function() {
            this.view.collection.trigger('reset:all');
            this.stopListening();

            this.collection = null;
            this.channel = null;
            this.uiBody = null;
        },

        /**
         * Change scroll position.
         */
        changeScrollTop: function(view, scrollTop) {
            this.uiBody.scrollTop(
                scrollTop -
                this.uiBody.offset().top +
                this.uiBody.scrollTop() - 100
            );
        },

        /**
         * Trigger `focus` event on the received model
         */
        modelFocus: _.debounce(function(model) {
            this.view.options.activeModel = model.id;
            model.trigger('focus');
        }, 10),

        /**
         * If a user has reached the first model in a collection
         * and it is notebooks composite view, trigger change:region event
         */
        onPageEnd: function() {
            if (this.options.regionToChange === 'tags') {
                Radio.trigger('appNotebooks', 'change:region', this.options.regionToChange, 'Next');
            }
        },

        /**
         * If a user has reached the first model in a collection
         * and it is tags composite view, trigger change:region event
         */
        onPageStart: function() {
            if (this.options.regionToChange === 'notebooks') {
                Radio.trigger('appNotebooks', 'change:region', this.options.regionToChange, 'Previous');
            }
        },

        /**
         * Navigate to the next model
         */
        navigateNext: function() {
            this.view.collection.getNextItem(this.view.options.activeModel);
        },

        /**
         * Navigate to the previous model
         */
        navigatePrevious: function() {
            this.view.collection.getPreviousItem(this.view.options.activeModel);
        }

    });

    return CompositeBehavior;
});
