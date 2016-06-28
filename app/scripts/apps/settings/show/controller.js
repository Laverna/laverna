/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define, requirejs */
define([
    'q',
    'underscore',
    'marionette',
    'backbone.radio',
    'apps/settings/controller',
    'helpers/fileSaver',
], function(Q, _, Marionette, Radio, BasicController, fileSaver) {
    'use strict';

    /**
     * Settings show controller.
     */
    var Controller = BasicController.extend({

        initialize: function(options) {

            // Execute parent initializer first
            _.bind(BasicController.prototype.initialize, this)(options);

            // Activate tab in sidebar
            Radio.request('AppSettings', 'activate:tab', this.options.tab);

            // Events, replies
            this.listenTo(Radio.channel('configs'), 'changed', this.onChangeConfigs);
        },

        /**
         * Load the tab view.
         */
        requireView: function() {
            requirejs(['apps/settings/show/views/' + this.options.tab], this.show);
        },

        /**
         * Show settings.
         */
        show: function(TabView) {

            // Execute parent function first
            _.bind(BasicController.prototype.show, this)(TabView);

            // View events
            this.listenTo(this.view, 'remove:profile', this.confirmRmProfile);
            this.listenTo(this.view, 'create:profile', this.createProfile);
            this.listenTo(this.view, 'import', this.import);
            this.listenTo(this.view, 'export', this.export);
        },

        /**
         * Create a new profile.
         */
        createProfile: function(name) {
            Radio.request('configs', 'create:profile', this.profiles, name);
        },

        /**
         * Before removing a profile, show a confirm message.
         */
        confirmRmProfile: function(name) {
            var self = this;

            Radio.request('Confirm', 'start', {
                content   : $.t('profile.confirm remove', {profile: name}),
                onconfirm : function() {
                    self.removeProfile(name);
                }
            });
        },

        /**
         * Remove a profile
         */
        removeProfile: function(name) {
            Radio.request('configs', 'remove:profile', this.profiles, name);
        },

        /**
         * Import settings from a JSON file
         */
        import: function(data) {
            var reader = new FileReader(),
                self   = this;

            reader.onload = function(evt) {
                try {
                    self.changes = JSON.parse(evt.target.result);
                    self.save();
                } catch (e) {
                    Radio.request('Confirm', 'start', {
                        title   : $.t('Wrong format'),
                        content : $.t('File chould be in json format')
                    });
                }
            };

            reader.readAsText(data.files[0]);
        },

        /**
         * Export settings to a JSON file.
         */
        export: function() {
            var blob = new Blob(
                [JSON.stringify(this.configs)],
                {type: 'text/plain;charset=utf8'}
            );
            fileSaver(blob, 'laverna-settings.json');
        },

        /**
         * Before closing the page, show a confirm message
         */
        confirmRedirect: function() {
            this.showConfirm(this.redirect);
        },

        redirect: function() {
            Radio.request('uri', 'navigate', '/notes', {
                trigger        : false,
                includeProfile : true
            });
            window.location.reload();
        }

    });

    return Controller;
});
