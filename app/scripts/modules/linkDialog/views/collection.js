/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'modules/linkDialog/views/item'
], function(_, Marionette, Radio, ItemView) {
    'use strict';

    /**
     * Shows a list of notes
     */
    var View = Marionette.CollectionView.extend({
        tagName   : 'ul',
        className : 'dropdown-menu',

        childView          : ItemView,
        childViewContainer : '.dropdown-menu',

        events: {
            'click a': 'link'
        },

        link: function(e) {
            var id    = $(e.currentTarget).attr('data-id'),
                model = this.collection.get(id);

            Radio.trigger('LinkDialog', 'attach:link', {
                url   : '#' + Radio.request('uri', 'link', {}, model),
                model : model
            });

            return false;
        }
    });

    return View;
});
