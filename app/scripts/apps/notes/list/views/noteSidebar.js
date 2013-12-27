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
            this.keyboardEvents[App.settings.appSearch] = 'focusSearch';

            // Options to itemView
            this.itemViewOptions.args = this.options.args;

            // Events
            this.listenTo(this.collection, 'changeFocus', this.changeFocus);
            this.listenTo(this.collection, 'change', this.render);
            this.listenTo(this.collection, 'nextPage', this.toNextPage);
            this.listenTo(this.collection, 'prevPage', this.toPrevPage);
        },

        onRender: function () {
        },

        toNextPage: function () {
            App.navigate(this.ui.nextPage.attr('href'));
        },

        toPrevPage: function () {
            App.navigate(this.ui.prevPage.attr('href'));
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
            return App.navigate('/notes/f/search/q/' + text, true);
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
                pageUrl: function (page) {
                    var url = '/notes';
                    if (this.args.filter !== null) {
                        url += '/f/' + this.args.filter;
                    }
                    if (this.args.query) {
                        url += '/q/' + this.args.query;
                    }
                    if (page !== undefined) {
                        url += '/p' + page;
                    }

                    return '#' + url;
                }
            };
        }

    });

    return View;
});
