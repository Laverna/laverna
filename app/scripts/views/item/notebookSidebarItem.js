/* global define */
define([
    'underscore',
    'backbone',
    'marionette',
    'text!notebookSidebarItemTempl'
], function (_, Backbone, Marionette, Tmpl) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl) ,

        className: 'list-group-tag',

        events: {
        },

        initialize: function () {
        },

        templateHelpers: function () {
            return {
            };
        }
    });

    return View;
});
