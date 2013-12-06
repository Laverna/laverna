/*global define */
/*global Markdown */
define([
        'underscore',
        'jquery',
        'backbone',
        'marionette',
        'text!configsTempl'
], function (_, $, Backbone, Marionette, Tmpl ) {
    'use strict';
    
    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl),

        initialize: function () {
            Mousetrap.reset();
        }
    });

    return View;
});
