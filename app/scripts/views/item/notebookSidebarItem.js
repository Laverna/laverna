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
            // 'click .list-group-tag': 'toNotebook'
        },

        initialize: function () {
            console.log(this.model.fetchRelated('notes'));
        },

        /**
         * Redirect to notebook page
         */
        toNotebook: function (e) {
            console.log(e.target);
        },

        templateHelpers: function () {
            return {
                count: function (notes) {
                    var count = 0;
                    if (notes !== null) {
                        count = notes.length;
                    }
                    return count;
                }
            };
        }
    });

    return View;
});
