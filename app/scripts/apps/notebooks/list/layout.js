/*global define */
define([
    'underscore',
    'app',
    'backbone',
    'text!apps/notebooks/list/templates/layout.html',
    'backbone.mousetrap',
    'marionette',
], function (_, App, Backbone, Templ) {
    'use strict';

    var Layout = App.module('AppNotebook.List.Layout');

    /**
     * Layout view
     */
    Layout.View = Backbone.Marionette.Layout.extend({
        template: _.template(Templ),

        regions: {
            notebooks :  '#notebooks',
            tags      :  '#tags'
        },

        keyboardEvents: {
            'o' : 'openActiveLink'
        },

        ui: {
            navbarSearchForm : '.search-form'
        },

        events: {
            'click .sync-button': 'syncWithCloud',
            'click .btn-search'  : 'showSearch',
            'blur .search-input' : 'hideSearch'
        },

        initialize: function () {
            this.keyboardEvents[App.settings.navigateBottom] = 'next';
            this.keyboardEvents[App.settings.navigateTop] = 'prev';
            this.keyboardEvents[App.settings.appSearch] = 'showSearch';
            this.keyboardEvents['esc'] = 'hideSearch';
        },

        /**
         * Force sync
         */
        syncWithCloud: function (e) {
            e.preventDefault();
            this.trigger('syncWithCloud', true);
        },

        openActiveLink: function () {
            var a = this.$('.list-group-item.active');
            if (a.length) {
                App.navigate(a.attr('href'), true);
            }
        },

        showSearch: function (e) {
            if (typeof (e) !== 'undefined') {
                e.preventDefault();
            }

            this.ui.navbarSearchForm.removeClass('hidden');
            this.ui.navbarSearchForm.find('input').focus().select();
            $('.navbar-nav').addClass('hidden');
        },

        hideSearch: function (e) {
            if (typeof (e) !== 'undefined') {
                e.preventDefault();
            }

            this.ui.navbarSearchForm.addClass('hidden');
            $('.navbar-nav').removeClass('hidden');
        },

        /**
         * Navigation: next
         */
        next: function () {
            if ( !this.activeRegion) {
                this.activeRegion = 'notebooks';
            }
            this[this.activeRegion].currentView.trigger('next');
            this[this.activeRegion].currentView.on('changeRegion', this.changeNext, this);
        },

        /**
         * Navigation: prev
         */
        prev: function () {
            if ( !this.activeRegion) {
                this.activeRegion = 'notebooks';
            }
            this[this.activeRegion].currentView.trigger('prev');
        },

        changeNext: function (region) {
            if (this.options[region] !== 0) {
                this.activeRegion = region;
            }
        },

        serializeData: function () {
            var data = {
                syncButton  : (App.settings.cloudStorage.toString() === '0') ? 'hidden' : ''
            };

            return data;
        },

        templateHelpers: function () {
            return {
                i18n: $.t
            };
        }
    });

    return Layout.View;
});
