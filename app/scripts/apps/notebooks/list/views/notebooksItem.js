/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'apps/notebooks/list/behaviors/itemBehavior',
    'text!apps/notebooks/list/templates/notebooksItem.html'
], function(_, Marionette, Radio, ItemBehavior, Tmpl) {
    'use strict';

    /**
     * Notebooks item view.
     * Everything happens in its behaviour.
     */
    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        className: 'list-group-tag',

        behaviors: {
            ItemBehavior: {
                behaviorClass: ItemBehavior
            }
        },

        serializeData: function() {
            return _.extend(this.model.decrypt(), {
                uri  : Radio.request('uri', 'link:profile', '')
            });
        }
    });

    return View;
});
