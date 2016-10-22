/**
 * Copyright (C) 2015 Laverna project Authors.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/* global define */
define([
    'underscore',
    'q',
    'marionette',
    'backbone.radio',
    'apps/help/firstStart/view',
    'fileSaver',
], function(_, Q, Marionette, Radio, View, fileSaver) {
    'use strict';

    var Controller = Marionette.Object.extend({

        initialize: function() {
            _.bindAll(this, 'show', 'destroy', 'save', 'mark', 'close');

            this.profile = Radio.request('uri', 'profile');

            Q.all([
                Radio.request('configs', 'get:config', 'encrypt'),
                Radio.request('notes', 'fetch', {profile: this.profile}),
                Radio.request('notebooks', 'fetch', {profile: this.profile}),
                Radio.request('tags', 'fetch', {profile: this.profile})
            ])
            .spread(this.show)
            .fail(function(e) {
                console.error('Error:', e);
            });
        },

        onDestroy: function() {
            Radio.request('global', 'region:empty', 'modal');
            this.view = null;
        },

        show: function(encrypt, notes, notebooks, tags) {
            /**
             * If encryption is enabled or there is some data, showing
             * installation process is not necessary.
             */
            if (Number(encrypt) ||
                (notes.length || notebooks.length || tags.length)) {
                return this.close();
            }

            // Clear old encryption secure from session storage
            window.sessionStorage.clear();

            this.view = new View();
            Radio.request('global', 'region:show', 'modal', this.view);

            this.listenTo(this.view, 'save', this.save);
            this.listenTo(this.view, 'import', this.import);
            this.listenTo(this.view, 'close', this.reload);
            this.listenTo(this.view, 'redirect', this.close);
            this.listenTo(this.view, 'download', this.download);
        },

        import: function() {
            Radio.request('uri', 'navigate', '/settings/importExport', {
                trigger       : true,
                includeProfile: true
            });
            this.close();
        },

        /**
         * Export user's settings.
         */
        download: function() {
            Radio.request('configs', 'get:all', {profile: this.profile})
            .then(function(configs) {
                var blob = new Blob(
                    [JSON.stringify(configs)],
                    {type: 'text/plain;charset=utf8'}
                );
                fileSaver(blob, 'laverna-settings.json');

                window.location.reload();
            });
        },

        /**
         * Save settings.
         */
        save: function() {
            var password     = this.view.ui.password.val().trim(),
                cloudStorage = this.view.ui.cloudStorage.val().trim(),
                promises     = [],
                self         = this;

            if (password.length) {
                promises.push(this.savePassword(password));
            }

            if (cloudStorage !== '0') {
                promises.push(this.saveCloud(cloudStorage));
            }

            return Q.all(promises)
            .then(this.mark)
            .then(function() {
                if (!promises.length) {
                    return self.close();
                }

                self.view.trigger('save:after');
            });
        },

        savePassword: function(password) {
            var encryptSalt = Radio.request('encrypt', 'randomize', 5, 0, true);

            return Q.all([
                Radio.request('configs', 'save:object', {
                    name: 'encrypt',
                    value: '1'
                }, undefined, {profile: this.profile}),
                Radio.request('configs', 'save:object', {
                    name: 'encryptSalt',
                    value: encryptSalt
                }, undefined, {profile: this.profile}),
                Radio.request('configs', 'save:object', {
                    name: 'encryptPass',
                    value: password
                }, undefined, {profile: this.profile}),
            ]);
        },

        saveCloud: function(cloudStorage) {
            return Radio.request('configs', 'save:object', {
                name: 'cloudStorage',
                value: cloudStorage
            }, undefined, {profile: this.profile});
        },

        /**
         * Mark that installation process was done.
         */
        mark: function() {
            return Radio.request('configs', 'save:object', {
                name  : 'firstStart',
                value : '0'
            }, undefined, {profile: this.profile});
        },

        reload: function() {
            window.location.reload();
        },

        close: function() {
            this.mark()
            .then(this.destroy);
        },

    });

    return Controller;
});
