/*global define */
define([
        'underscore',
        'backbone',
        'marionette',
        'notebookSidebarItem',
        'text!notebookSidebarTempl',
        'backbone.mousetrap'
], function(_, Backbone, Marionette, notebookSidebarItem, Template) {
    'use strict';

    //_.extend(Marionette.CompositeView, Backbone.View);

    var View = Marionette.CompositeView.extend({
        template: _.template(Template),
        itemView: notebookSidebarItem,
        itemViewContainer: '.list-notebooks',
        className: 'sidebar-tags',
        id: 'sidebar'
    });

    return View;

});
