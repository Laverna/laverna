/**
 * Copyright (C) 2015 Laverna project Authors.
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define, requirejs */
define([
    'jquery',
    'q',
    'underscore',
    'marionette',
    'backbone.radio',
    'fileSaver',
    'apps/settings/show/views/showView'
], function($, Q, _, Marionette, Radio, saveAs, View) {
    'use strict';

    /**
     * Settings show controller.
     *
     * Replies:
     * 1. channel: `AppSettings`, replies: `has:changes`
     *    if there are some changes, show a confirm message
     *
     * requests:
     * 1. channel: `AppSettings`, request: `activate`
     * 2. channel: `global`, request: `region:empty`
     * 3. channel: `global`, request: `region:show`
     * 4. channel: `configs`, request: `create:profile`
     * 5. channel: `configs`, request: `remove:profile`
     * 6. channel: `configs`, request: `save:objects`
     * 7. channel: `Confirm`, request: `start`
     * 8. channel: `uri`, request: `navigate`
     * 9. channel: `navbar`, request: `stop`
     */
    var Controller = Marionette.Object.extend({

        initialize: function(options) {
            _.bindAll(this, 'show', 'requireView', 'redirect');

            this.options = options;
            this.changes = {};
            this.saves   = {};

            // Activate tab in sidebar
            Radio.request('AppSettings', 'activate:tab', this.options.tab);

            // Fetch configs
            Q.all([
                Radio.request('configs', 'get:all', options),
                Radio.request('configs', 'get:model', {
                    name    : 'useDefaultConfigs',
                    profile : options.profile
                }),
                Radio.request('configs', 'get:model', 'appProfiles')
            ])
            .spread(this.requireView);

            // Events, replies
            Radio.reply('AppSettings', 'has:changes', this.hasChanges, this);
            this.listenTo(Radio.channel('configs'), 'changed', this.onChangeConfigs);
        },

        onDestroy: function() {
            this.stopListening();
            Radio.stopReplying('AppSettings', 'has:changes');
            Radio.request('global', 'region:empty', 'content');
        },

        /**
         * Show layout view and load a tab view
         */
        requireView: function(configs, useDefault, profiles) {
            this.configs    = configs;
            this.profiles   = profiles;
            this.useDefault = useDefault;

            // Instantiate layout view and show it
            this.layout = new View(this.options);
            Radio.request('global', 'region:show', 'content', this.layout);

            // Load tab view
            requirejs(['apps/settings/show/views/' + this.options.tab], this.show);
        },

        /**
         * Show settings.
         */
        show: function(TabView) {
            // Instantiate tab view
            this.view = new TabView({
                collection : this.configs,
                profiles   : this.profiles,
                useDefault : this.useDefault
            });

            this.layout.content.show(this.view);

            // Collection events
            this.listenTo(this.configs, 'new:value', this.onChange);

            // Layout events
            this.listenTo(this.layout, 'cancel', this.confirmRedirect);
            this.listenTo(this.layout, 'save', this.save);

            // View events
            this.listenTo(this.view, 'remove:profile', this.confirmRmProfile);
            this.listenTo(this.view, 'create:profile', this.createProfile);
            this.listenTo(this.view, 'import', this.import);
            this.listenTo(this.view, 'export', this.export);
        },

        /**
         * Reload the page when config 'useDefaultConfigs' is changed
         */
        onChangeConfigs: function(changes) {
            if (changes.useDefaultConfigs) {
                window.location.reload();
            }
        },

        onChange: function(data) {
            this.changes[data.name] = data;
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

        save: function() {
            // Do nothing if there are not any changes
            if (_.isEmpty(this.changes)) {
                return;
            }

            Radio.channel('configs')
            .request('save:objects', this.changes, this.useDefault);

            this.saves = _.union(this.saves, this.changes);
            this.changes = {};
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
            saveAs(blob, 'laverna-settings.json');
        },

        /**
         * Before closing the page, show a confirm message
         */
        confirmRedirect: function() {
            this.showConfirm(this.redirect);
        },

        /**
         * If there are any changes, show a confirm message.
         */
        hasChanges: function() {
            var defer = Q.defer();
            this.showConfirm(defer.resolve, defer.reject);
            return defer.promise;
        },

        showConfirm: function(onconfirm, onreject) {
            if (_.isEmpty(this.changes)) {
                return onconfirm();
            }

            Radio.request('Confirm', 'start', {
                content   : $.t('You have unsaved changes.'),
                onconfirm : onconfirm,
                onreject  : onreject
            });
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
