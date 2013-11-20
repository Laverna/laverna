/*global define */
define([
    'underscore',
    'backbone',
    'marionette',
    'sidebar',
    'noteSidebarItem',
    'text!noteSidebarTempl',
    'backbone.mousetrap'
], function(_, Backbone, Marionette, Sidebar, NoteSidebarItem, Template) {
    'use strict';

    // Integrations backbone.mousetrap into marionette
    _.extend(Marionette.CompositeView, Backbone.View);
    Sidebar = _.clone(Sidebar);

    var View = _.extend(Sidebar, {
    // var View = Marionette.CompositeView.extend({
        template: _.template(Template),

        itemView: NoteSidebarItem,

        itemViewContainer: '.main',

        itemViewOptions: {},

        className: 'sidebar-notes',

        // How many items should be shown
        perPage : 8,

        ui: {
            prevPage    : '#prevPage',
            nextPage    : '#nextPage',
            searchInput : '#search-input'
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

    View = Marionette.CompositeView.extend(View);
    return View;
});
