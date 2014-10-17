/* global define */
define([
    'underscore',
    'jquery',
    'backbone',
    'helpers/uri',
    'text!apps/navbar/show/template.html',
    'backbone.mousetrap',
    'marionette'
], function (_, $, Backbone, URI, Tmpl) {
    'use strict';

    var View = Backbone.Marionette.ItemView.extend({
        template: _.template(Tmpl),

        keyboardEvents:  { },

        ui:  {
            locationIcon     :  '#location-icon',
            navbarSearchForm :  '.search-form',
            navbarSearchInput:  '.search-form input',
            syncBtn          :  '.sync-button',
            syncStatus       :  '#syncStatus'
        },

        events:  {
            'click .btn-search'           : 'showSearch',
            'blur .search-input'          : 'hideSearch',
            'keyup @ui.navbarSearchInput' : 'searchKeyup',
            'submit @ui.navbarSearchForm' : 'searchSubmit'
        },

        triggers: {
            'click @ui.syncBtn': 'syncWithCloud'
        },

        initialize: function () {
            this.keyboardEvents[this.options.settings.appSearch] = 'showSearch';

            // Show sync status
            this.on('sync:before', this.syncBefore, this);
            this.on('sync:after', this.syncAfter, this);
        },

        onRender: function () {
            var iconClass = (this.options.args.filter === null) ? 'note' : this.options.args.filter;
            this.ui.locationIcon.removeClass();
            this.ui.locationIcon.addClass('icon-' + iconClass);
        },

        syncBefore: function () {
            this.ui.syncStatus.addClass('animate-spin');
        },

        syncAfter: function () {
            this.ui.syncStatus.removeClass('animate-spin');
        },

        searchSubmit: function (e) {
            e.preventDefault();
            var text = this.ui.navbarSearchInput.val();
            this.trigger('navigate', URI.link('/notes/f/search/q/' + text));
        },

        searchKeyup: function (e) {
            if (e.which === 27) {
                this.ui.navbarSearchInput.blur();
            }
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
                settings: this.options.settings,
                uri : URI.link('/'),
                notebooks: (this.options.inNotebooks) ? null : this.options.notebooks,
                profile: URI.getProfile()
            };
        },

        templateHelpers: function () {
            return {
                isSyncEnabled: function () {
                    if (this.settings.cloudStorage.toString() === '0') {
                        return 'hidden';
                    }
                },

                urlPage : function () {
                    if (this.args.currentApp === 'AppNotebook') {
                        return URI.link('/notebooks');
                    } else {
                        return URI.link('/notes');
                    }
                },

                pageNumber: function () {
                    return (this.args.page || '');
                },

                notebook: function (model) {
                    return model.decrypt().name;
                },

                link: function (profile) {
                    return URI.link('/notes', profile);
                }
            };
        }
    });

    return View;
});
