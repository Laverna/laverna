/* global define */
define([
    'jquery',
    'marionette'
], function($, Marionette) {
    'use strict';

    var ItemBehavior = Marionette.Behavior.extend({
        modelEvents: {
            'active': 'makeActive'
        },

        makeActive: function() {
            // Search by data-id attribute because child objects have the same class name
            var $item = this.view.$('.list-group-item[data-id=' + this.view.model.get('id') + ']'),
                $ui = $('#sidebar .ui-body');

            $item.addClass('active');

            // Make an item visible
            if ($ui.length) {
                $ui.scrollTop(
                    $item.offset().top - $ui.offset().top + ($ui.scrollTop() - 100)
                );
            }
        }
    });

    return ItemBehavior;
});
