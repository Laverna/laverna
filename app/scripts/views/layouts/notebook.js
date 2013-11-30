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

            this.collectionNotebooks = this.options.collectionNotebooks;
            this.collectionTags = this.options.collectionTags;

            // Navigation events
            this.on('notebooks:navigate', this.navigateNotebooks);
            this.on('tags:navigate', this.navigateTags);
        },

        toNotes: function () {
            var active = this.$el.find('.list-group-item.active'),
                url;

            if (active.length !== 0) {
                url = active.attr('href');
                return Backbone.history.navigate(url, true);
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
        },

        nextOrPrev: function (navigate) {
            var active = this.$el.find('.list-group-item.active'),
                activeParent,
                activeId;

            if (active.length === 0) {
                this.trigger('notebooks:navigate', {active : 0});
            } else {
                activeParent = active.parent();
                activeId = parseInt(active.attr('data-id'));

                // Only notebooks has childrens
                if (activeParent.children('.tags').length !== 0) {
                    this.trigger('notebooks:navigate', {
                        active: activeId,
                        navigate: navigate
                    });
                } else {
                    this.trigger('tags:navigate', {
                        active: activeId,
                        navigate: navigate
                    });
                }
            }

            active.removeClass('active');
        },

        /**
         * Tags navigation
         */
        navigateTags: function (opts) {
            var notebook,
                el;

            if (opts.active !== 0) {
                notebook = this.collectionTags.navigate(opts.active, opts.navigate);
            } else {
                notebook = this.collectionTags.at(0);
            }

            el = this.$('#tags a[data-id=' + notebook.get('id') + ']');
            el.addClass('active');
        },

        /**
         * Notebooks navigation
         */
        navigateNotebooks: function (opts) {
            var notebook,
                el;

            if (opts.active !== 0) {
                notebook = this.collectionNotebooks.navigate(opts.active, opts.navigate);
            } else {
                notebook = this.collectionNotebooks.at(0);
            }

            if (notebook !== null) {
                el = this.$('#notebooks a[data-id=' + notebook.get('id') + ']');
                el.addClass('active');
            } else {
                this.trigger('tags:navigate', {active: 0});
            }
        }

    });

    Notebook = Marionette.Layout.extend(Notebook);
    return Notebook;
});
