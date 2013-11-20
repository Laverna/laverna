/*global define */
define([
    'underscore',
    'backbone',
    'marionette',
    'noteSidebarItem',
    'text!noteSidebarTempl',
    'backbone.mousetrap'
], function(_, Backbone, Marionette, NoteSidebarItem, Template) {
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
            searchInput: '#search-input'
        },

        events: {
            'submit .search-form': 'toSearch',
        },

        keyboardEvents: {
            'j'   :  'navigateBottom',
            'k'   :  'navigateTop',
            'c'   :  'toCreate',
            'g f' :  'showFavorites',
            'g t' :  'showTrashed',
            'g i' :  'showInbox',
            'g n' :  'toNotebook',
            '/'   :  'focusSearch'
        },

        initialize: function () {
            this.itemViewOptions.page = this.options.lastPage;
            this.itemViewOptions.shownNotebook = this.options.notebookId;
            this.itemViewOptions.filter = this.options.filter;
            this.itemViewOptions.notebookId = this.options.notebookId;
            this.itemViewOptions.searchQuery = this.options.searchQuery;

            // Filter
            var notes;
            switch (this.options.filter) {
                case 'favorite':
                    notes = this.collection.getFavorites();
                    this.urlPage = '/note/favorite';
                    break;
                case 'trashed':
                    notes = this.collection.getTrashed();
                    this.urlPage = '/note/trashed';
                    break;
                case 'search':
                    notes = this.collection.search(this.options.searchQuery);
                    this.urlPage = '/note/search/' + this.options.searchQuery;
                    break;
                default:
                    if (this.options.notebookId !== 0) {
                        notes = this.collection.getNotebookNotes(this.options.notebookId);
                    } else {
                        notes = this.collection.getActive();
                    }
                    this.urlPage = '/note/' + this.options.notebookId;
                    break;
            }

            // Pagination
            this.collection.reset(notes);
            this.pagination(notes);
        },

        /**
         * Focus on search form
         */
        focusSearch: function(e) {
            e.preventDefault();
            this.ui.searchInput.focus();
        },

        /**
         * Redirects to search page
         */
        toSearch: function (e) {
            e.preventDefault();
            var text = this.ui.searchInput.val();
            return Backbone.history.navigate('/note/search/' + text + '/p1', true);
        },

        /**
         * Redirects to notebooks list page
         */
        toNotebook: function () {
            return Backbone.history.navigate('/notebooks', true);
        },

        /**
         * Redirects to favorite notes page
         */
        showFavorites: function() {
            return Backbone.history.navigate('/note/favorite/p1', true);
        },

        /**
         * Redirects to Inbox page, index page
         */
        showInbox: function() {
            return Backbone.history.navigate('/note/0/p1', true);
        },

        /**
         * Notes which has been removed to trash
         */
        showTrashed: function() {
            return Backbone.history.navigate('/note/trashed/p1', true);
        },

        /**
         * Redirects to note creating page
         */
        toCreate: function (e) {
            e.preventDefault();
            return Backbone.history.navigate('/note/add', true);
        },

        /**
         * Redirects to previous pagination page
         */
        navigateTop: function () {
            return this.nextOrPrev('prev');
        },

        /**
         * Redirects to next pagination page
         */
        navigateBottom: function () {
            return this.nextOrPrev('next');
        },

        nextOrPrev: function (n) {
            var active, url = '/', id, note, i, prev;

            // Active note
            active = this.$el.find('.list-group-item.active');
            id = active.attr('data-id');
            note = this.collection.get(id);
            i = this.collection.indexOf(note);

            if ((i + 1) === this.perPage && n === 'next') {
                url = this.ui.nextPage.attr('href');
            } else if (i === 0 && n === 'prev') {
                url = this.ui.prevPage.attr('href');
            } else {
                if (n === 'prev') {
                    i = (i > 0) ? i - 1 : 0;
                } else {
                    i = (i === (this.collection.length - 1)) ? i : i + 1;
                }

                prev = this.collection.at(i);
                url = this.urlPage + '/p' + this.lastPage + '/show/' + prev.get('id');
            }

            Backbone.history.navigate(url, true);
        },

        /**
         * Pagination
         */
        pagination: function (notes) {
            this.pageCount = this.collection.length;

            if (this.options.lastPage !== undefined) {
                this.lastPage  = parseInt(this.options.lastPage, null);
            } else {
                this.lastPage = 1;
            }

            // Next note
            var nextI = this.perPage * this.lastPage;
            if (this.collection.length > nextI) {
                var nextNote = this.collection.at(nextI);
                this.nextNote = nextNote.get('id');
            }

            // Prev note
            var prevI = (nextI - this.perPage) - 1;
            if (prevI > 0) {
                var prevNote = this.collection.at(prevI);
                this.prevNote = prevNote.get('id');
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

        serializeData: function () {
            var viewData = {};
            viewData.nextPage = this.nextPage;
            viewData.nextNote = this.nextNote;
            viewData.prevPage = this.prevPage;
            viewData.prevNote = this.prevNote;
            viewData.urlPage  = this.urlPage;
            viewData.searchQuery = this.options.searchQuery;
            return viewData;
        },

        templateHelpers: function () {
            return {
                // Generates the pagination url
                pageUrl: function (page, noteId, urlPage) {
                    var url;
                    url = urlPage + '/p' + page;

                    if (noteId) {
                        url += '/show/' + noteId;
                    }

                    return '#' + url;
                }
            };
        }

    });

    return View;
});
