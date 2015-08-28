/* global define */
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'text!apps/settings/sidebar/templates/navbar.html'
], function(_, Marionette, Radio, Tmpl) {
    'use strict';

    /**
     * Settings navbar
     */
    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl)
    });

    return View;

});
