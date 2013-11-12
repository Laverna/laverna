/*global define */
define([
    'underscore',
    'backbone',
    'marionette',
    'notebookSidebarItem',
    'text!notebookSidebarTempl',
    'backbone.mousetrap'
], function(_, Backbone, Marionette, notebookSidebarItem, Tmpl) {
    'use strict';

    //_.extend(Marionette.CompositeView, Backbone.View);

    var View = Marionette.CompositeView.extend({
        template: _.template(Tmpl),

        itemView: notebookSidebarItem,
        itemViewContainer: '.list-notebooks',

        className: 'sidebar-tags',
        id: 'sidebar',

        /**
         * Build tree structure
         */
        appendHtml: function (colView, itemView) {
            var parentId = parseInt(itemView.model.get('parentId'));

            console.log(parentId);
            if (parentId === 0) {
                colView.$(this.itemViewContainer).append(itemView.el);
            } else {
                this.$('div[data-id=' + parentId + ']').append(itemView.el);
            }
        }
    });

    return View;

});
