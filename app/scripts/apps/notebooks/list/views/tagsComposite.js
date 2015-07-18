/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'apps/notebooks/list/behaviors/compositeBehavior',
    'apps/notebooks/list/views/tagsItem',
    'text!apps/notebooks/list/templates/tagsList.html'
], function(_, Marionette, Radio, Behavior, ItemView, Tmpl) {
    'use strict';

    /**
     * Tags composite view.
     * Everything happens in its behavior class.
     */
    var View = Marionette.CompositeView.extend({
        template: _.template(Tmpl),

        childView: ItemView,
        childViewContainer: '.list--tags',

        behaviors: {
            CompositeBehavior: {
                behaviorClass  : Behavior,
                channel        : 'tags',
                regionToChange : 'notebooks'
            }
        },

        collectionEvents: {
            'page:next': 'onPageNext'
        },

        onPageNext: function() {
            this.collection.getPage(this.collection.state.currentPage + 1);
        },

        templateHelpers: function() {
            return {
                uri : function() {
                    return Radio.request('uri', 'link:profile', '');
                }
            };
        }

    });

    return View;
});
