/* global define */
define([
    'underscore',
    'backbone',
    'marionette',
    'text!notebookSidebarItemTempl',
    'sjcl'
], function (_, Backbone, Marionette, Tmpl) {
    'use strict';

    var View = Marionette.ItemView.extend({
        template: _.template(Tmpl) ,

        className: 'list-group-tag',

        events: {
        },

        initialize: function () {
        },

        serializeData: function ( ) {
            console.log(this.options.configs);
            var data = this.model.decrypt(this.options.configs);
            return data;
        },

        templateHelpers: function () {
            return {
            };
        }
    });

    return View;
});
