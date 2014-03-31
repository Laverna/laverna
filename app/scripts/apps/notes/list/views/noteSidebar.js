/*global define*/
define([
    'underscore',
    'app',
    'backbone', 'apps/notes/list/views/noteSidebarItem', 'text!apps/notes/list/templates/sidebarList.html',
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
            nextPage    : '#nextPage',
            locationIcon: '#location-icon'
        },

        events: {
            'click .sync-button': 'syncWithCloud',
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

        onRender: function () {
            // Make sidebar active
            if ( !this.options.args.id) {
                $(App.content.el).removeClass('active-row');
            }

            var iconClass = (this.options.args.filter === null) ? 'note' : this.options.args.filter;
            this.ui.locationIcon.removeClass();
            this.ui.locationIcon.addClass('icon-' + iconClass);
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

        syncWithCloud: function (e) {
            e.preventDefault();
            this.trigger('syncWithCloud');
        },

        serializeData: function () {
            var viewData = {
                title       : this.options.title,
                urlPage     : this.urlPage,
                args        : this.options.args,
                syncButton  : (App.settings.cloudStorage.toString() === '0') ? 'hidden' : ''
            };
            return viewData;
        },

        templateHelpers: function () {
            return {
                i18n: $.t,

                urlPage : function () {
                    return '/notes';
                },

                pageTitle: function () {
                    var title = 'All notes';
                    if (this.args.filter) {
                        title = this.args.filter;
                    }
                    title = $.t(title.substr(0,1).toUpperCase() + title.substr(1));

                    if (this.args.query) {
                        title += ': ' + this.args.query;
                    }

                    return title;
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
