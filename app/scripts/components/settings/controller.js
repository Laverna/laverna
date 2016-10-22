/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'q',
    'underscore',
    'marionette',
    'backbone.radio',
    'apps/settings/show/views/showView'
], function(Q, _, Marionette, Radio, View) {
    'use strict';

    /**
     * The main controller.
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
            _.bindAll(this, 'show', 'onFetch', 'requireView', 'redirect');

            options.tab  = options.tab || 'modules';
            this.options = options;
            this.changes = {};
            this.saves   = {};

            // Fetch configs
            Q.all([
                Radio.request('configs', 'get:all', options),
                Radio.request('configs', 'get:model', {
                    name    : 'useDefaultConfigs',
                    profile : options.profile
                }),
                Radio.request('configs', 'get:model', 'appProfiles')
            ])
            .spread(this.onFetch)
            .then(this.requireView)
            .fail(function(e) {
                console.error('Error:', e);
            });

            // Events, replies
            Radio.reply('AppSettings', 'has:changes', this.hasChanges, this);
        },

        onDestroy: function() {
            this.stopListening();
            Radio.stopReplying('AppSettings', 'has:changes');
            Radio.request('global', 'region:empty', 'content');
        },

        /**
         * Show the layout.
         */
        onFetch: function(configs, useDefault, profiles) {
            this.configs    = configs;
            this.profiles   = profiles;
            this.useDefault = useDefault;

            // Instantiate layout view and show it
            this.layout = new View(this.options);
            Radio.request('global', 'region:show', 'content', this.layout);
        },

        /**
         * Load a content view.
         */
        requireView: function() {
        },

        /**
         * Render the content view.
         */
        show: function(ContentView) {
            this.view = new ContentView({
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
        },

        onChange: function(data) {
            this.changes[data.name] = data;
        },

        /**
         * Reload the page when config 'useDefaultConfigs' is changed
         */
        onChangeConfigs: function(changes) {
            if (changes.useDefaultConfigs) {
                window.location.reload();
            }

            this.redirect();
        },

        save: function() {

            // Do nothing if there are not any changes
            if (_.isEmpty(this.changes)) {
                this.redirect();
                return;
            }

            Radio.channel('configs')
            .request('save:objects', this.changes, this.useDefault);

            this.saves = _.union(this.saves, this.changes);
            this.changes = {};
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
                content   : $.t('You have unsaved changes'),
                onconfirm : onconfirm,
                onreject  : onreject
            });
        },

    });

    return Controller;
});
