/*global define*/
define([
    'underscore',
    'app',
    'backbone',
    'helpers/uri',
    'apps/notes/list/views/noteSidebarItem',
    'text!apps/notes/list/templates/sidebarList.html',
    'backbone.mousetrap',
    'marionette'
], function(_, App, Backbone, URI, NoteSidebarItem, Template) {
    'use strict';

    var View = Backbone.Marionette.CompositeView.extend({
        template: _.template(Template),

        itemView          : NoteSidebarItem,
        itemViewContainer : '.main',
        className         : 'sidebar-notes',

        itemViewOptions : { },
        keyboardEvents  : { },

        ui: {
            prevPage         : '#prevPage',
            nextPage         : '#nextPage'
        },

        events: {
        },

        collectionEvents: {
            'changeFocus' : 'changeFocus',
            'change'      : 'render',
            'nextPage'    : 'toNextPage',
            'prevPage'    : 'toPrevPage',
        },

        initialize: function () {
            // Navigation with keys
            this.keyboardEvents[App.settings.navigateBottom] = 'navigateBottom';
            this.keyboardEvents[App.settings.navigateTop] = 'navigateTop';

            // Options to itemView
            this.itemViewOptions.args = this.options.args;
        },

        onRender: function () {
            // Make sidebar active
            if ( !this.options.args.id) {
                $(App.content.el).removeClass('active-row');
            }

            this.changeFocus(this.options.args.id || null);
        },

        toNextPage: function () {
            App.navigate(this.ui.nextPage.attr('href'), true);
        },

        toPrevPage: function () {
            App.navigate(this.ui.prevPage.attr('href'), true);
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

        serializeData: function () {
            var viewData = {
                title       : this.options.title,
                args        : this.options.args,
                pagination  : this.collection.length >= App.settings.pagination
            };
            return viewData;
        },

        templateHelpers: function () {
            return {
                i18n: $.t,

                // Generates the pagination url
                pageUrl: function (page) {
                    page = page || 0;
                    return '#' + URI.note(this.args, page);
                }
            };
        }

    });

    return View;
});
