/* global define */
define([
    'jquery',
    'underscore',
    'marionette',
    'backbone.radio',
    'views/loader',
    'modules/fuzzySearch/views/item',
    'text!modules/fuzzySearch/templates/composite.html'
], function($, _, Marionette, Radio, LoaderView, ItemView, Tmpl) {
    'use strict';

    /**
     * Composite view which shows "fuzzy" search results
     */
    var CompositeView = Marionette.CompositeView.extend({
        template  : _.template(Tmpl),

        childView          : ItemView,
        childViewContainer : '.notes-list',
        childViewOptions   : {},
        emptyView          : LoaderView
    });

    return CompositeView;
});
