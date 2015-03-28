/* global define */
define([
    'underscore',
    'backbone',
    'backbone.radio',
    'marionette'
], function(_, Backbone, Radio, Marionette) {
    'use strict';

    /**
     * Uri helper. It is a convenient module that we use to navigate
     * or do some URI related stuff.
     * It listens to commands and requests on `uri` channel.
     *
     * Responds to:
     * -----------
     * Commands:
     * 1. command: `navigate`
     *    navigate to provided URL.
     * 2. command: `back`
     *    it navigates to the previous page.
     *
     * Requests:
     * 1. request: `profile`
     *    returns current profile name.
     * 2. request: `link:profile`
     *    returns a link to a profile.
     * 3. request: `link`
     *    generates and returns a link to notes list or to a note.
     */
    var Uri = Marionette.Object.extend({

        initialize: function() {
            this.vent = Radio.channel('uri');

            // Commands
            this.vent
            .comply('navigate', this.navigate, this)
            .comply('back', this.navigateBack, this);

            // Replies
            this.vent
            .reply('profile', this.getProfile, this)
            .reply('link:profile', this.getProfileLink, this)
            .reply('link', this.getLink, this);
        },

        /**
         * Navigate to url
         */
        navigate: function(uri, options) {
            if (_.isObject(uri)) {
                uri = (uri.model || uri.options) ? uri : {options: uri};
                uri = this.getLink(uri.options, uri.model);
            }

            Backbone.history.navigate(uri, options || {trigger: true});
        },

        navigateBack: function(url) {
            var history = window.history;
            if (history.length === 0) {
                return this.navigate(url || '/notes');
            }
            history.go(-1);
        },

        /**
         * Generates a link to a profile
         */
        getProfileLink: function(uri, profile) {
            profile = profile || this.getProfile();
            uri     = (uri[0] !== '/' ? '/' + uri : uri);

            return !profile ? uri : '/p/' + profile + uri;
        },

        /**
         * Returns current profile's name
         */
        getProfile: function() {
            var route = this.getRoute(),
                uri = (route ? route.split('/') : '');

            return (uri[0] === 'p' ? uri[1] : null);
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
            options = _.extend({}, options);
            var url = '/notes',
                filters = {
                    profile : '/p/',
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
            return url;
        }

    });

    /**
     * Add a new initializer
     */
    Radio.command('init', 'add', 'app', function() {
        new Uri();
    });

    return Uri;
});
