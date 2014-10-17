/* global define */
define([
    'underscore',
    'marionette',
    'helpers/uri',
    'apps/notebooks/list/behaviors/itemBehavior',
    'text!apps/notebooks/list/templates/notebooksItem.html'
], function(_, Marionette, URI, ItemBehavior, Templ) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Templ),

        className: 'list-group-tag',

        behaviors: {
            ItemBehavior: {
                behaviorClass: ItemBehavior
            }
        },

        serializeData: function() {
            return _.extend(this.model.decrypt(), {
                uri  : URI.link('')
            });
        }
    });

    return View;
});
