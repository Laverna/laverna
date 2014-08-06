/* global define */
define([
    'underscore',
    'marionette',
    'apps/notebooks/list/views/notebooksItem',
    'helpers/uri',
    'text!apps/notebooks/list/templates/notebooksList.html'
], function (_, Marionette, ItemView, URI, Templ) {
    'use strict';

    var View = Marionette.CompositeView.extend({
        template: _.template(Templ),

        childView: ItemView,
        childViewContainer: '.list-notebooks',
        childViewOptions: {},

        initialize: function () {
            this.on('next', this.next, this);
            this.on('prev', this.prev, this);

            this.childViewOptions.uri = URI.link('');
        },

        /**
         * Build tree structure
         */
        attachHtml: function (colView, itemView) {
            var parentId = itemView.model.get('parentId');

            if (parentId === '0' || parentId === '') {
                this.$(colView.childViewContainer).append(itemView.el);
            } else {
                this.$('div[data-id=' + String(parentId) + ']').append(itemView.el);
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
