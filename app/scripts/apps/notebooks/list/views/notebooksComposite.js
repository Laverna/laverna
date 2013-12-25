/* global define */
define([
    'underscore',
    'app',
    'marionette',
    'apps/notebooks/list/views/notebooksItem',
    'text!apps/notebooks/list/templates/notebooksList.html'
], function (_, App, Marionette, ItemView, Templ) {
    'use strict';

    var View = Marionette.CompositeView.extend({
        template: _.template(Templ),

        itemView: ItemView,

        itemViewContainer: '.list-notebooks',

        /**
         * Build tree structure
         */
        appendHtml: function (colView, itemView) {
            var parentId = parseInt(itemView.model.get('parentId'));

            if (parentId === 0) {
                colView.$(this.itemViewContainer).append(itemView.el);
            } else {
                this.$('div[data-id=' + parentId + ']').append(itemView.el);
            }
        },
    });
    
    return View;
});
