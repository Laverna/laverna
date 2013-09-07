/*global define */
define(['underscore', 'backbone', 'marionette', 'noteSidebarItem', 'text!noteSidebarTempl'],
function(_, Backbone, Marionette, NoteSidebarItem, Template) {
    'use strict';

    var View = Marionette.CompositeView.extend({
        template: _.template(Template),

        itemView: NoteSidebarItem,

        itemViewContainer: '.main > .list-group',

        className: 'sidebar-notes',

        perPage : 8,

        ui: {
            prevPage: '#prevPage',
            nextPage: '#nextPage',
        },

        events: {
            'click .list-group-item': 'changeFocus',
            'keypress .search-form input[type="text"]': 'search',
        },

        initialize: function () {
            this.pagination();
        },

        pagination: function () {
            var notes = this.collection.getActive();
            this.collection.reset(notes);

            this.pageCount = this.collection.length;

            if (this.options.lastPage !== undefined) {
                this.lastPage  = parseInt(this.options.lastPage, null);
            } else {
                this.lastPage = 1;
            }

            notes = this.collection.pagination(this.perPage, this.lastPage);
            this.collection.reset(notes);

            // Next page
            if ( Math.round(this.pageCount / this.perPage) > this.lastPage) {
                this.nextPage = this.lastPage + 1;
            } else {
                this.nextPage = this.lastPage;
            }

            // Previous page
            this.prevPage = (this.lastPage !== 1) ? this.lastPage - 1 : 1;
        },

        onRender: function () {
        },

        serializeData: function () {
            var viewData = {};
            viewData.nextPage = this.nextPage;
            viewData.prevPage = this.prevPage;
            return viewData;
        },

        search: function(e) {
            var el = $(e.currentTarget);
            if (el.val().length >= 1) {
                // var collection = this.collection.search(el.val());
            }
        },

        changeFocus: function(e) {
            this.$el.find('.list-group-item.active').removeClass('active');
            $(e.currentTarget).addClass('active');
        }

    });

    return View;
});
