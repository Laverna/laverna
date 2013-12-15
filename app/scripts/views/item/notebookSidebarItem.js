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
            var data = this.model.toJSON();
            if (this.options.configs.get('encrypt').get('value') === 1) {
                data.name = sjcl.decrypt(this.options.key, data.name);
            }
            return data;
        },

        templateHelpers: function () {
            return {
            };
        }
    });

    return View;
});
