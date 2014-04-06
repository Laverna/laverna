/* global define */
define([
    'underscore',
    'jquery',
    'app',
    'backbone',
    'text!apps/navbar/show/template.html',
    'backbone.mousetrap',
    'marionette'
], function (_, $, App, Backbone, Tmpl) {
    'use strict';

    var View = Backbone.Marionette.ItemView.extend({
        template                 : _.template(Tmpl),

        keyboardEvents           : { },

        ui                       : {
            locationIcon         : '#location-icon',
            navbarSearchForm     : '.search-form'
        },

        events                   : {
            'click .sync-button' : 'syncWithCloud',
            'click .btn-search'  : 'showSearch',
            'blur .search-input' : 'hideSearch'
        },

        initialize: function () {
            this.keyboardEvents[App.settings.appSearch] = 'showSearch';
        },

        onRender: function () {
            var iconClass = (this.options.args.filter === null) ? 'note' : this.options.args.filter;
            this.ui.locationIcon.removeClass();
            this.ui.locationIcon.addClass('icon-' + iconClass);
        },

        syncWithCloud: function (e) {
            e.preventDefault();
            App.sidebar.currentView.trigger('syncWithCloud');
        },

        showSearch: function (e) {
            if (typeof (e) !== 'undefined') {
                e.preventDefault();
            }

            this.ui.navbarSearchForm.removeClass('hidden');
            this.ui.navbarSearchForm.find('input').focus().select();
            this.$('.navbar-nav').addClass('hidden');
        },

        hideSearch: function (e) {
            if (this.ui.navbarSearchForm.hasClass('hidden')) {
                return;
            }

            if (typeof (e) !== 'undefined') {
                e.preventDefault();
            }

            this.ui.navbarSearchForm.addClass('hidden');
            this.$('.navbar-nav').removeClass('hidden');
        },

        serializeData: function () {
            return {
                args: this.options.args,
                syncButton  : (App.settings.cloudStorage.toString() === '0') ? 'hidden' : '',
            };
        },

        changeArgs: function (args) {
            this.options.args = args;
            this.render();
        },

        templateHelpers: function () {
            return {
                i18n: $.t,

                urlPage : function () {
                    if (App.currentApp.moduleName === 'AppNotebook') {
                        return '/notebooks';
                    } else {
                        return '/notes';
                    }
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
                }
            };
        }
    });

    return View;
});
