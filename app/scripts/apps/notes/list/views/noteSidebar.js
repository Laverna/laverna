/*global define*/
define([
    'underscore',
    'app',
    'backbone',
    'apps/notes/list/views/noteSidebarItem',
    'text!apps/notes/list/templates/sidebarList.html',
    'backbone.mousetrap',
    'marionette'
], function(_, App, Backbone, NoteSidebarItem, Template) {
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
            nextPage    : '#nextPage'
        },

        events: {
            'click syncStatus': 'syncWithCloud',
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
            this.listenTo(this.collection, 'nextPage', this.toNextPage);
            this.listenTo(this.collection, 'prevPage', this.toPrevPage);
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

        syncWithCloud: function () {
            this.trigger('syncWithCloud');
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
                pageTitle: function () {
                    if (this.args.filter) {
                        return this.args.filter;
                    } else {
                        return 'Inbox';
                    }
                },
                pageNumber: function () {
                    if (this.args.page) {
                        return this.args.page;
                    }
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
