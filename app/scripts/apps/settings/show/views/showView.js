/*global define*/
define([
    'underscore',
    'jquery',
    'marionette',
    'text!apps/settings/show/templates/showTemplate.html',
    'apps/settings/show/views/basic',
    'apps/settings/show/views/shortcuts',
    'apps/settings/show/views/importExport',
    'apps/settings/show/views/profiles'
], function (_, $, Marionette, Tmpl, Basic, Shortcuts, Import, Profiles) {
    'use strict';

    var View = Marionette.LayoutView.extend({
        template: _.template(Tmpl),

        className: 'modal fade',

        stayOnHashchange: true,

        regions: {
            content: '#tab-content'
        },

        events: {
            'click .ok'  : 'save',
            'click .modal-header li a': 'viewTab'
        },

        triggers: {
            'click .cancelBtn'  : 'close'
        },

        collectionEvents: {
            'new:value': 'cacheChanges'
        },

        initialize: function () {
            this.changedSettings = [];

            this.on('hidden.modal', this.redirect, this);
            this.on('shown.modal', this.makeTabActive, this);
            this.on('show:tab', this.showTab, this);
        },

        cacheChanges: function (data) {
            this.changedSettings.push(data);
        },

        showTab: function (args) {
            var data = { collection: this.collection },
                view;

            args = args || this.options.args;
            switch (args.tab) {
                case 'shortcuts':
                    view = new Shortcuts(data);
                    break;
                case 'other':
                    view = new Import(data);
                    break;
                case 'profiles':
                    view = new Profiles(data);
                    break;
                default:
                    view = new Basic(data);
                    break;
            }

            this.content.show(view);
        },

        viewTab: function (e) {
            var tab = this.$(e.target).attr('href').replace('#', '');
            this.trigger('show:tab', {tab: tab});
        },

        makeTabActive: function () {
            var tab = this.options.args.tab;
            this.$('.modal-header ul a[href="#' + tab + '"]').click();
        },

        save: function () {
            this.collection.trigger('save:all', this.changedSettings);
        },

        redirect: function () {
            this.trigger('redirect', this.changedSettings);
        }
    });

    return View;
});
