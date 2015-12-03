/**
 * Copyright (C) 2015 Laverna project Authors.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'jquery',
    'marionette',
    'backbone.radio'
], function($, Marionette, Radio) {
    'use strict';

    /**
     * Item behavior class for notebooks and tags views.
     *
     * Triggers requests:
     * 1. channel: `appNotebooks`, request: `[notebooks|tags]:remove`
     *    expects that the provided model will be removed.
     */
    var ItemBehavior = Marionette.Behavior.extend({
        modelEvents: {
            'focus': 'makeActive'
        },

        events: {
            'click .remove-link': 'triggerRemove'
        },

        triggerRemove: function() {
            var event = this.view.model.storeName + ':remove';
            Radio.request('appNotebooks', event, null, this.view.model.id);
            return false;
        },

        makeActive: function() {
            // Search by data-id attribute because child objects have the same class name
            var $item = this.view.$('.list-group-item[data-id=' + this.view.model.get('id') + ']');

            $('.list-group-item.active').removeClass('active');
            $item.addClass('active');

            this.view.trigger('scroll:top', $item.offset().top);
        }
    });

    return ItemBehavior;
});
