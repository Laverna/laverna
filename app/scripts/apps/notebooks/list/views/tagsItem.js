/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'text!apps/notebooks/list/templates/tagsItem.html'
], function (_, App, Marionette, Templ) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Templ),

        className: 'list-group-tag',
    });

    return View;
});
