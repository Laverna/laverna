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
    'backbone',
    'backbone.radio',
    'marionette',
], function(_, Backbone, Radio, Marionette) {
    'use strict';

    /**
     * Uri helper. It is a convenient module that we use to navigate
     * or do some URI related stuff.
     * It listens to requests on `uri` channel.
     *
     * Responds to:
     * -----------
     *
     * Requests:
     * 1. request: `profile`
     *    returns current profile name.
     * 2. request: `link:profile`
     *    returns a link to a profile.
     * 3. request: `link`
     *    generates and returns a link to notes list or to a note.
     * 4. request: `link:file`
     *    generate file URL.
     * 5. request: `navigate`
     *    navigate to provided URL.
     * 6. request: `back`
     *    it navigates to the previous page.
     */
    var Uri = Marionette.Object.extend({

        initialize: function() {
            this.vent    = Radio.channel('uri');
            this.profile = this.getProfile();

            _.bindAll(this, 'checkProfile');
            $(window).on('hashchange', this.checkProfile);

            // Replies
            this.vent.reply({
                'navigate'      : this.navigate,
                'back'          : this.navigateBack,
                'profile'       : this.getProfile,
                'link:profile'  : this.getProfileLink,
                'link:file'     : this.getFileLink,
                'link'          : this.getLink,
                'get:current'   : this.getRoute,
            }, this);
        },

        checkProfile: function() {
            if (this.getProfile() !== this.profile) {
                window.location.reload();
            }
        },

        /**
         * Navigate to url
         */
        navigate: function(uri, options) {
            options = options || {};
            if (typeof options.trigger === 'undefined') {
                options.trigger = true;
            }

            // Build URL to notes list or a note
            if (_.isObject(uri)) {
                uri = (uri.model || uri.options) ? uri : {options: uri};
                uri = this.getLink(uri.options, uri.model);
            }

            // Include profile link
            if (options.includeProfile) {
                uri = this.getProfileLink(uri);
                options.includeProfile = null;
            }

            Backbone.history.navigate(uri, options);
        },

        navigateBack: function(url) {
            var history = window.history;
            if (history.length === 0) {
                return this.navigate(url || '/notes', arguments[1]);
            }
            history.back();
        },

        /**
         * Generate file URL.
         */
        getFileLink: function(model, blob) {
            // Just generate pseudo URL
            if (!blob) {
                return '#file:' + model.id;
            }

            var url = window.URL || window.webkitURL,
                src = (model.src || model.get('src'));

            return url.createObjectURL(src);
        },

        /**
         * Generates a link to a profile
         */
        getProfileLink: function(uri, profile) {
            profile = profile || this.getProfile();
            uri     = (uri[0] !== '/' ? '/' + uri : uri);

            return !profile ? uri : '/p/' + profile + uri.replace(/\/?p\/[^/]*\//, '/');
        },

        /**
         * Returns current profile's name
         */
        getProfile: function() {
            var profile = document.location.hash.match(/\/?p\/([^/]*)\//);
            return (!profile ? profile : profile[profile.index]);
        },

        /**
         * Returns current route
         */
        getRoute: function() {
            return Backbone.history.fragment;
        },

        /**
         * Generates a link from provided options
         */
        getLink: function(options, model) {
            options = _.extend({}, options || {});
            var url = '/notes',
                filters = {
                    filter  : '/f/',
                    query   : '/q/',
                    page    : '/p'
                };

            options.page = isNaN(options.page) ? 0 : options.page;

            _.each(filters, function(value, filter) {
                if (_.has(options, filter) && options[filter]) {
                    url += value + options[filter];
                }
            });

            url += model ? '/show/' + model.id : '';
            return this.getProfileLink(url, options.profile);
        }

    });

    /**
     * Add a new initializer
     */
    Radio.request('init', 'add', 'app:before', function() {
        new Uri();
    });

    return Uri;
});
