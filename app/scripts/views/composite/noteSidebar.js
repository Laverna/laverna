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
            'submit .search-form'    : 'toSearch',
            'keypress #search-input' : 'escSearch'
        },

        keyboardEvents: {
        },

        initialize: function () {
            // Setting keyboardEvents
            var configs = this.options.configs.getConfigs();
            this.setKeyboardEvents( configs );
            this.keyboardEvents[configs['shortcuts-application-search-note']] = 'focusSearch';

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
                case 'tagged':
                    notes = this.collection.getTagNotes(parseInt(this.options.tagId));
                    this.urlPage = '/note/tag/' + this.options.tagId;
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

            // Set page title
            document.title = this.options.title;

            // Options to itemView
            this.itemViewOptions.page = this.options.lastPage;
            this.itemViewOptions.key = this.options.key;
            this.itemViewOptions.searchQuery = this.options.searchQuery;
            this.itemViewOptions.url = this.urlPage;
        },

        /**
         * Focus on search form
         */
        focusSearch: function(e) {
            e.preventDefault();
            this.ui.searchInput.focus();
        },

        /**
         * Unfocus if pressed ESC
         */
        escSearch: function (e) {
            if (e.which === 0) {
                this.ui.searchInput.trigger('blur');
            }
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
            var viewData = {
                title       : this.options.title,
                nextPage    : this.nextPage,
                nextNote    : this.nextNote,
                prevPage    : this.prevPage,
                prevNote    : this.prevNote,
                urlPage     : this.urlPage,
                searchQuery : this.options.searchQuery
            };
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
