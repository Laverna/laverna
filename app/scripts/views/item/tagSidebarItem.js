/* global define */
define([
    'underscore',
    'backbone',
    'marionette',
    'text!tagSidebarItemTempl'
], function (_, Backbone, Marionette, Tmpl) {
    'use strict';

    var Tag = Marionette.ItemView.extend({
        template: _.template(Tmpl) ,

        className: 'list-group',

        initialize: function () {
        }

    });

    return Tag;
});
