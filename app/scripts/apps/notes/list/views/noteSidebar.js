/*global define */
define([
    'underscore',
    'app',
    'backbone',
    'sidebar',
    'apps/notes/list/views/noteSidebarItem',
    'text!apps/notes/list/templates/sidebarList.html',
    'backbone.mousetrap',
    'marionette',
], function(_, App, Backbone, Sidebar, NoteSidebarItem, Template) {
    'use strict';

    var View = Backbone.Marionette.CompositeView.extend({
        template: _.template(Template),

        itemView: NoteSidebarItem,
        itemViewContainer: '.main',
        className: 'sidebar-notes',

        itemViewOptions : { },
        keyboardEvents  : { },

        ui: {
            prevPage    : '#prevPage',
            nextPage    : '#nextPage',
            searchInput : '#search-input'
        },

        events: {
            'submit .search-form'    : 'toSearch',
            'keypress #search-input' : 'escSearch'
        },

        initialize: function () {
            // Navigation with keys
            this.keyboardEvents[App.settings.navigateBottom] = 'navigateBottom';
            this.keyboardEvents[App.settings.navigateTop] = 'navigateTop';

            // Options to itemView
            this.itemViewOptions.args = this.options.args;

            // Events
            this.listenTo(this.collection, 'changeFocus', this.changeFocus);
            this.listenTo(this.collection, 'change', this.render);
        },

        onRender: function () {
        },

        navigateBottom: function () {
            this.collection.trigger('navigateBottom');
        },

        navigateTop: function () {
            this.collection.trigger('navigateTop');
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
         * Trigger model
         */
        changeFocus: function (note) {
            if ( typeof(note) === 'string') {
                note = this.collection.get(note);
            }
            if (note) {
                note.trigger('changeFocus');
            }
        },

        /**
         * Redirects to search page
         */
        toSearch: function (e) {
            e.preventDefault();
            var text = this.ui.searchInput.val();
            return App.navigate('/note/search/' + text + '/p1', true);
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
            this.prevPage = (this.lastPage > 1) ? this.lastPage - 1 : 1;
        },

        serializeData: function () {
            var viewData = {
                title       : this.options.title,
                urlPage     : this.urlPage,
                args        : this.options.args
            };
            return viewData;
        },

        templateHelpers: function () {
            return {
                urlPage : function () {
                    return '/notes';
                },
                // Generates the pagination url
                pageUrl: function () {
                    var url = '/notes';

                    if (this.args.filter !== null) {
                        url += '/f/' + this.args.filter;
                    }
                    if (this.args.page !== null) {
                        url += '/p' + this.args.page;
                    }

                    return '#' + url;
                }
            };
        }

    });

    return View;
});
