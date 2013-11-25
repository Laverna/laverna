/*global define */
define([
    'underscore',
    'backbone',
    'marionette',
    'tagSidebarItem',
    'text!tagsSidebarTempl',
], function(_, Backbone, Marionette, TagsItem, Tmpl) {
    'use strict';

    var Tags = Marionette.CompositeView.extend({
        template          : _.template(Tmpl),

        itemView          : TagsItem,
        itemViewContainer: '.list-notebooks',

        initialize: function () {
        }

    });

    return Tags;

});
