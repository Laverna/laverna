/* global define */
define([
    'underscore',
    'marionette',
    'text!templates/loader.html'
], function(_, Marionette, Tmpl) {
    'use strict';

    /**
     * Just a view which shows spinning icon.
     */
    var Loader = Marionette.ItemView.extend({
        template  : _.template(Tmpl)
    });

    return Loader;
});
