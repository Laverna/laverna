/* global define */
define([
    'underscore',
    'marionette',
    'helpers/uri',
    'apps/notebooks/list/behaviors/compositeBehavior',
    'apps/notebooks/list/views/tagsItem',
    'text!apps/notebooks/list/templates/tagsList.html'
], function(_, Marionette, URI, Behavior, ItemView, Templ) {
    'use strict';

    var View = Marionette.CompositeView.extend({
        template: _.template(Templ),

        childView: ItemView,
        childViewContainer: '.list-notebooks',

        behaviors: {
            CompositeBehavior: {
                behaviorClass: Behavior,
                regionToChange: 'notebooks'
            }
        },

        templateHelpers: function() {
            return { uri : URI.link };
        }

    });

    return View;
});
