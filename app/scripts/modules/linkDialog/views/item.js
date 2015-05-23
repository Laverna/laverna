/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'text!modules/linkDialog/templates/item.html'
], function(_, Marionette, Radio, Tmpl) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template : _.template(Tmpl),
        tagName  : 'li'
    });

    return View;
});
