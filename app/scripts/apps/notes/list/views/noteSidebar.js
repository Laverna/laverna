/*global define*/
define([
    'underscore',
    'app',
    'marionette',
    'apps/notes/list/views/noteSidebarItem',
    'text!apps/notes/list/templates/sidebarList.html',
    'backbone.mousetrap'
], function(_, App, Marionette, NoteSidebarItem, Template) {
    'use strict';

    var View = Marionette.CompositeView.extend({
        template           :  _.template(Template),
        className          :  'sidebar-notes',

        childView          :  NoteSidebarItem,
        childViewContainer :  '.notes-list',
        childViewOptions   :  { },

        keyboardEvents     :  { },

        ui: {
            prevPage         : '#prevPage',
            nextPage         : '#nextPage'
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

            // Options to childView
            this.childViewOptions.args = this.options.args;
        },

        onRender: function () {
            // Make sidebar active
            if ( !this.options.args.id) {
                $(App.content.el).removeClass('active-row');
            }

            this.changeFocus(this.options.args.id || null);
        },

        toNextPage: function () {
            App.vent.trigger('navigate', this.ui.nextPage.attr('href'));
        },

        toPrevPage: function () {
            App.vent.trigger('navigate', this.ui.prevPage.attr('href'));
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
                    return '#' + App.request('uri:note', this.args, page);
                }
            };
        }

    });

    return View;
});
