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

        initialize: function () {
            this.on('next', this.next, this);
            this.on('prev', this.prev, this);
        },

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

        getActive: function () {
            var elActive = this.$('.active'),
                idActive = elActive.attr('data-id');

            if (idActive) {
                elActive.removeClass('active');
                return this.collection.get(idActive);
            }
        },

        next: function () {
            var notebook = this.getActive(),
                isLast = this.collection.indexOf(notebook)+1 === this.collection.length;

            if (isLast) {
                this.trigger('changeRegion', 'tags');
            } else if (notebook) {
                notebook.next().trigger('active');
            } else {
                this.collection.at(0).trigger('active');
            }
        },

        prev: function () {
            var notebook = this.getActive(),
                notFirst = this.collection.indexOf(notebook) !== 0;

            if (notebook && notFirst) {
                notebook.prev().trigger('active');
            } else if (!notebook) {
                this.collection.at(this.collection.length-1).trigger('active');
            } else {
                this.collection.at(0).trigger('active');
            }
        }

    });

    return View;
});
