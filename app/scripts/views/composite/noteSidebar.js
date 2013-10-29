/*global define */
define(['underscore', 'backbone', 'marionette', 'noteSidebarItem', 'text!noteSidebarTempl', 'backbone.mousetrap'],
function(_, Backbone, Marionette, NoteSidebarItem, Template) {
    'use strict';

    // Integrations backbone.mousetrap into marionette
    _.extend(Marionette.CompositeView, Backbone.View);

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

        keyboardEvents: {
            'j' :  'navigateBottom',
            'k' :  'navigateTop',
            'c' :  'toCreate'
        },

        initialize: function () {
            this.itemViewOptions.page = this.options.lastPage;
            this.itemViewOptions.shownNotebook = this.options.notebookId;

            this.pagination();
        },

        toCreate: function () {
            Backbone.history.navigate('/note/add', true);
        },

        navigate: function(el) {
            var href = null;

            if (typeof (el) === 'object') {
                console.log(el.children('.list-group-item').attr('href'));
                href = el.children('.list-group-item').attr('href');
            } else if (typeof (el) === 'string' && el !== '') {
                href = el;
            }

            if (href !== null ) {
                Backbone.history.navigate(href);
            }
        },

        navigateBottom: function () {
            var active = this.$el.find('.list-group-item.active');
            var newActive = active.parent().next('.list-group'); 
            
            if (newActive.length === 0 && active.length === 0) {
                newActive = this.$el.find('.list-group:first');
            } else if (newActive.length === 0 && active.length !== 0) {
                newActive = this.ui.nextPage.attr('href');
            }

            this.navigate(newActive);
        },

        navigateTop: function () {
            var active = this.$el.find('.list-group-item.active');
            var newActive = active.parent().prev('.list-group'); 
            
            if (newActive.length === 0 && active.length === 0) {
                newActive = this.$el.find('.list-group:last');
            } else if (newActive.length === 0 && active.length !== 0) {
                newActive = this.ui.prevPage.attr('href');
            }

            this.navigate(newActive);
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
