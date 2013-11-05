/*global define */
define([
    'underscore',
    'backbone',
    'marionette',
    'noteSidebarItem',
    'text!noteSidebarTempl',
    'backbone.mousetrap'
], function(_, Backbone, Marionette, NoteSidebarItem, Template) {
    'use strict';

    // Integrations backbone.mousetrap into marionette
    _.extend(Marionette.CompositeView, Backbone.View);

    var View = Marionette.CompositeView.extend({
        template: _.template(Template),

        itemView: NoteSidebarItem,

        itemViewContainer: '.main',

        itemViewOptions: {},

        className: 'sidebar-notes',

        // How many items should be shown
        perPage : 8,

        ui: {
            prevPage: '#prevPage',
            nextPage: '#nextPage',
        },

        events: {
            'click .list-group-item': 'changeFocus',
            'keypress .search-form input[type="text"]': 'search',
        },

        keyboardEvents: {
            'j' :  'navigateBottom',
            'k' :  'navigateTop',
            'c' :  'toCreate',
            'g+f' : 'showFavorites',
            'g+t' : 'showTrashed'
        },

        initialize: function () {
            this.itemViewOptions.page = this.options.lastPage;
            this.itemViewOptions.shownNotebook = this.options.notebookId;

            // Filter
            var notes;
            switch (this.options.filter) {
                case 'favorite':
                    notes = this.collection.getFavorites();
                    this.collection.reset(notes);
                    break;
                case 'trashed':
                    notes = this.collection.getTrashed();
                    this.collection.reset(notes);
                default:
                    notes = this.collection.getActive();
                    this.collection.reset(notes);
                    break;
            }

            // Pagination
            this.pagination(notes);
        },

        showFavorites: function(e) {
            return Backbone.history.navigate('/note/favorite/p0', true);
        },

        showTrashed: function(e) {
            return Backbone.history.navigate('/note/trashed/p0', true);
        },

        toCreate: function (e) {
            e.preventDefault();
            return Backbone.history.navigate('/note/add', true);
        },

        navigateTop: function () {
            return this.nextOrPrev('prev');
        },

        navigateBottom: function () {
            return this.nextOrPrev('next');
        },

        nextOrPrev: function (n) {
            var active, url = '/', id, note, i, prev;

            // Active note
            active = this.$el.find('.list-group-item.active');
            id = active.attr('data-id');
            note = this.collection.get(id);
            i = this.collection.indexOf(note);

            if ((i + 1) === this.perPage && n === 'next') {
                url = this.ui.nextPage.attr('href');
            } else if (i === 0 && n === 'prev') {
                url = this.ui.prevPage.attr('href');
            } else {
                if (n === 'prev') {
                    i = (i > 0) ? i - 1 : 0;
                    console.log(i);
                } else {
                    i = (i === (this.collection.length - 1)) ? i : i + 1;
                }

                prev = this.collection.at(i);
                url = '/note/' + 0 + '/p' + this.lastPage + '/show/' + prev.get('id');
            }

            Backbone.history.navigate(url, true);
        },

        changeFocus: function(e) {
            this.$el.find('.list-group-item.active').removeClass('active');
            $(e.currentTarget).addClass('active');
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
                console.log('next==' + nextI);
                var nextNote = this.collection.at(nextI);
                this.nextNote = nextNote.get('id');
            }

            // Prev note
            var prevI = (nextI - this.perPage) - 1;
            if (prevI > 0) {
                console.log('prev==' + prevI);
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
            this.prevPage = (this.lastPage !== 1) ? this.lastPage - 1 : 1;
        },

        /**
         * Disable pagination buttons
         */
        disableBtn: function () {
            if (this.nextPage === this.lastPage) {
                this.ui.nextPage.addClass('disabled');
            }
            if (this.lastPage === 1) {
                this.ui.prevPage.addClass('disabled');
            }
        },

        serializeData: function () {
            var viewData = {};
            viewData.nextPage = this.nextPage;
            viewData.nextNote = this.nextNote;
            viewData.prevPage = this.prevPage;
            viewData.prevNote = this.prevNote;
            return viewData;
        }

    });

    return View;
});
