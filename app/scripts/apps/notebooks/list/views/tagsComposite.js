/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'apps/notebooks/list/views/tagsItem',
    'text!apps/notebooks/list/templates/tagsList.html'
], function (_, App, Marionette, ItemView, Templ) {
    'use strict';

    var View = Marionette.CompositeView.extend({
        template: _.template(Templ),
        itemView: ItemView,
        itemViewContainer: '.list-notebooks'
    });

    return View;
});
