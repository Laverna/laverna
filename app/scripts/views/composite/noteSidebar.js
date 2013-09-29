/*global define */
define(['underscore', 'backbone', 'marionette', 'noteSidebarItem', 'text!noteSidebarTempl'],
function(_, Backbone, Marionette, NoteSidebarItem, Template) {
    'use strict';

    var View = Marionette.CompositeView.extend({
        template: _.template(Template),

        itemView: NoteSidebarItem,

        itemViewContainer: '.main',

        itemViewOptions: {},

        className: 'sidebar-notes',

        // How many items should be shown
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
            this.itemViewOptions.page = this.options.lastPage;
            this.itemViewOptions.shownNotebook = this.options.notebookId;

            this.pagination();
        },

        changeFocus: function(e) {
            this.$el.find('.list-group-item.active').removeClass('active');
            $(e.currentTarget).addClass('active');
        },

        /**
         * Pagination
         */
        pagination: function () {
            // Get active notes
            var notes = this.collection.getActive();
            this.collection.reset(notes);

            this.pageCount = this.collection.length;

            if (this.options.lastPage !== undefined) {
                this.lastPage  = parseInt(this.options.lastPage, null);
            } else {
                this.lastPage = 1;
            }

            // Limit
            notes = this.collection.pagination(this.perPage, this.lastPage);
            this.collection.reset(notes);

            // Next page
            if ( (this.pageCount / this.perPage) > this.lastPage) {
                this.nextPage = this.lastPage + 1;
            } else {
                this.nextPage = this.lastPage;
            }

            // Previous page
            this.prevPage = (this.lastPage !== 1) ? this.lastPage - 1 : 1;
        },

        /**
         * Disable pagination buttons
         */
        disableBtn: function () {
            if (this.nextPage === this.lastPage) {
                this.ui.nextPage.addClass('disabled');
            }
            if (this.lastPage === 1) {
                this.ui.prevPage.addClass('disabled');
            }
        },

        serializeData: function () {
            var viewData = {};
            viewData.nextPage = this.nextPage;
            viewData.prevPage = this.prevPage;
            return viewData;
        }

    });

    return View;
});
