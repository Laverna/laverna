/*global define */
define([
    'underscore',
    'backbone',
    'marionette',
    'sidebar',
    'noteSidebarItem',
    'text!noteSidebarTempl',
    'backbone.mousetrap',
    'sjcl'
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
            this.options.page = parseInt(this.options.page);

            // Options to itemView
            this.itemViewOptions.url = this.options.url;
            this.itemViewOptions.page = this.options.page;
            this.itemViewOptions.configs = this.options.configs;

            // Setting keyboardEvents
            this.configs = this.options.configs;
            this.setKeyboardEvents(this.configs);
            this.keyboardEvents[this.configs.appSearch] = 'focusSearch';

            // Set page title
            document.title = this.options.title;
        },

        onRender: function () {
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

        serializeData: function () {
            var data = {
                title       : this.options.title,
                urlPage     : this.options.url,
                searchQuery : this.options.searchQuery
            };

            // Next pagination page
            data.nextPage = this.options.page + parseInt(this.configs.pagination);

            // Previous pagination page
            data.prevPage = 1;
            if (this.configs.pagination < this.options.page) {
                data.prevPage = this.options.page - this.configs.pagination;
            }

            return data;
        },

        templateHelpers: function () {
            return {
                // Generates the pagination url
                pageUrl: function (page, urlPage) {
                    var url;
                    url = urlPage + '/p' + page;

                    return '#' + url;
                }
            };
        }

    });

    View = Marionette.CompositeView.extend(View);
    return View;
});
