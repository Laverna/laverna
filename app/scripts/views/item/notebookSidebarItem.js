/* global define */
define([
        'underscore',
        'backbone',
        'marionette',
        'text!notebookSidebarItemTempl'
], function (_, Backbone, Marionette, Template) {
    'use strict';
    var View = Marionette.ItemView.extend({
        template: _.template(Template) ,
        className: 'list-group-tag'
    });

    return View;
});
