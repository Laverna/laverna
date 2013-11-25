/*global define*/
define([
    'underscore',
    'backbone',
    'marionette',
    'sidebar',
    'text!notebookLayoutTempl',
    'backbone.mousetrap'
], function(_, Backbone, Marionette, Sidebar, Tmpl) {
    'use strict';

    // Re extend in order to use mousetrap
    _.extend(Marionette.Layout, Backbone.View);

    Sidebar = _.clone(Sidebar);

    var Notebook = _.extend(Sidebar, {
        template: _.template(Tmpl),

        regions: {
            notebooks :  '#notebooks',
            tags      :  '#tags'
        },

        events: {
            'submit .search-form'    : 'toSearch',
            'keypress #search-input' : 'escSearch'
        },

        ui: {
            searchInput : '#search-input'
        },

        initialize: function () {
            this.keyboardEvents = _.extend(this.keyboardEvents, {
                'o' : 'toNotes',
                '/' : 'focusSearch'
            });
        },

        toNotes: function () {
            var active = this.$el.find('.list-group-item.active'),
                id;

            if (active.length !== 0) {
                id = active.attr('data-id');
                return Backbone.history.navigate('/note/' + id + '/p1', true);
            }
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
        }

    });

    Notebook = Marionette.Layout.extend(Notebook);
    return Notebook;
});
