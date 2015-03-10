/*global define*/
define([
    'underscore',
    'marionette',
    'backbone.radio',
    'apps/notes/list/views/noteSidebarItem',
    'text!apps/notes/list/templates/sidebarList.html',
    'backbone.mousetrap'
], function(_, Marionette, Radio, NoteSidebarItem, Tmpl) {
    'use strict';

    /**
     * Sidebar composite view.
     *
     * Listens to
     * -----------
     * Events:
     * 1. channel: `notes`, event: `model:navigate`
     *    Makes the provided model active.
     */
    var View = Marionette.CompositeView.extend({
        template           :  _.template(Tmpl),
        className          :  'sidebar-notes',

        childView          :  NoteSidebarItem,
        childViewContainer :  '.notes-list',
        childViewOptions   :  {},

        keyboardEvents     :  {},

        ui: {
            pageNav  : '#pageNav',
            prevPage : '#prevPage',
            nextPage : '#nextPage',
            body     : '.ui-body'
        },

        events: {
            'click @ui.nextPage': 'nextPage',
            'click @ui.prevPage': 'previousPage'
        },

        collectionEvents: {
            'page:next'     : 'nextPage',
            'page:previous' : 'previousPage',
            'reset'         : 'updatePagination'
        },

        childEvents: {
            'scroll:top': 'changeScrollTop'
        },

        initialize: function() {
            _.bindAll(this, 'toNextNote', 'toPreviousNote');

            this.configs = Radio.request('global', 'configs');

            // Shortcuts
            this.keyboardEvents[this.configs.navigateBottom] = 'toNextNote';
            this.keyboardEvents[this.configs.navigateTop] = 'toPreviousNote';

            // Events
            this.listenTo(Radio.channel('notes'), 'model:navigate', this.modelFocus, this);

            // Pass options to childView
            this.childViewOptions.args = this.options.args;
        },

        onBeforeRender: function() {
            this.options.args = Radio.request('appNote', 'route:args') || this.options.args;
            this.childViewOptions.args = this.options.args;
        },

        /**
         * Makes the provided model active.
         */
        modelFocus: function(model) {
            this.options.args.id = model.id;
            model.trigger('focus');
        },

        toNextNote: function() {
            this.collection.getNextItem(this.options.args.id);
            return false;
        },

        toPreviousNote: function() {
            this.collection.getPreviousItem(this.options.args.id);
            return false;
        },

        /**
         * Updates pagination buttons
         */
        updatePagination: function() {
            this.ui.pageNav.toggleClass('hidden', this.collection.state.totalPages <= 1);
            this.ui.prevPage.toggleClass('disabled', !this.collection.hasPreviousPage());
            this.ui.nextPage.toggleClass('disabled', !this.collection.hasNextPage());
        },

        /**
         * Gets next page's models and resets the collection
         */
        nextPage: function() {
            this.navigatePage(1);
            this.collection.getNextPage();
        },

        /**
         * Gets previous page's models and resets the collection
         */
        previousPage: function() {
            this.navigatePage(-1);
            this.collection.getPreviousPage();
        },

        /**
         * Saves page status in window.location
         */
        navigatePage: function(number) {
            var uri = this.collection.state.currentPage + number;
            uri = Radio.request('global', 'uri:note', this.options.args, uri);
            Radio.trigger('global', 'navigate:link', uri, {trigger: false});
        },

        /**
         * Changes scroll position.
         */
        changeScrollTop: function(view, scrollTop) {
            this.ui.body.scrollTop(
                scrollTop -
                this.ui.body.offset().top +
                this.ui.body.scrollTop() - 100
            );
        },

        serializeData: function() {
            var viewData = {
                collection  : this.collection,
                args        : this.options.args
            };
            return viewData;
        }

    });

    return View;
});
