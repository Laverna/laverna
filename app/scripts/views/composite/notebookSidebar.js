/*global define */
define([
    'underscore',
    'backbone',
    'marionette',
    'sidebar',
    'notebookSidebarItem',
    'text!notebookSidebarTempl',
    'backbone.mousetrap'
], function(_, Backbone, Marionette, Sidebar, notebookSidebarItem, Tmpl) {
    'use strict';

    _.extend(Marionette.CompositeView, Backbone.View);
    Sidebar = _.clone(Sidebar);

    var View = _.extend(Sidebar, {
        template: _.template(Tmpl),

        itemView: notebookSidebarItem,
        itemViewContainer: '.list-notebooks',

        className: 'sidebar-tags',
        id: 'sidebar',

        initialize: function () {
            this.keyboardEvents = _.extend(this.keyboardEvents, {
                'o' : 'toNotes'
            });
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

        /**
         * Redirects to notebooks page
         */
        toNotes: function () {
            var active = this.$el.find('.list-group-item.active'),
                id;

            if (active.length !== 0) {
                id = active.attr('data-id');
                return Backbone.history.navigate('/note/' + id + '/p1', true);
            }
        },

        nextOrPrev: function (n) {
            var active, id, note, i;

            // Active note
            active = this.$el.find('.list-group-item.active');
            id = active.attr('data-id');
            note = this.collection.get(id);
            i = this.collection.indexOf(note);

            if (n === 'prev') {
                i = (i > 0) ? i - 1 : 0;
            } else {
                i = (i === (this.collection.length - 1)) ? i : i + 1;
            }

            note = this.collection.at(i);
            active.removeClass('active');
            this.$('[data-id=' + note.get('id') + ']').addClass('active');
        }
    });

    View = Marionette.CompositeView.extend(View);
    return View;

});
