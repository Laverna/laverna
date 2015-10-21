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
