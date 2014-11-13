/*global define*/
define([
    'underscore',
    'backbone',
    'backbone.wreqr'
], function (_, Backbone) {
    'use strict';

    var instance = null;

    /**
     * Helper to navigate and build URLs
     */
    function URI() {
        this.init();
    }

    _.extend(URI.prototype, {

        // Register response and event listeners
        init: function() {
            var channel = Backbone.Wreqr.radio.channel('global');
            _.bindAll(this, 'link', 'note', 'getProfile', 'navigateLink');

            // Events
            channel.vent.on('navigate', this.navigate, this);
            channel.vent.on('navigate:link', this.navigateLink, this);
            channel.vent.on('navigate:back', this.goBack, this);

            // Responses
            channel.reqres.setHandler('uri:route', this.getCurrentRoute, this);
            channel.reqres.setHandler('uri:profile', this.getProfile, this);
            channel.reqres.setHandler('uri:link', this.link, this);
            channel.reqres.setHandler('uri:note', this.note, this);
        },

        /**
         * Build an URI and navigate
         */
        navigateLink: function() {
            arguments[0] = this.link(arguments[0]);
            this.navigate.apply(this, arguments);
        },

        /**
         * Navigate to URI
         * @param string uri a hash link
         * @param object options navigate options
         */
        navigate: function(uri, options) {
            options = (arguments.length > 1 ? options : {trigger: true});
            Backbone.history.navigate(uri, options);
        },

        /**
         * Navigate back
         * @param string defUrl default URL. Used when history.length is empty
         * @param number pages number of pages to go
         */
        goBack: function(defUrl, pages) {
            var history = window.history;
            if (history.length === 0) {
                this.navigate((defUrl || '/notes'), {trigger: true});
            } else {
                history.go( (arguments.length > 1 ? pages : -1) );
            }
        },

        /**
         * Returns current route
         */
        getCurrentRoute: function() {
            return Backbone.history.fragment;
        },

        /**
         * Returns current profile's name
         */
        getProfile: function () {
            var route = this.getCurrentRoute(),
                uri = (route ? route.split('/') : '');

            if (_.contains(uri, 'p')) {
                return uri[1];
            }
            else {
                return null;
            }
        },

        /**
         * Adds to a provided URL link to profile
         * @param string uri URL
         * @param string profile profile name (optional)
         */
        link: function (uri, profile) {
            if (profile) {
                uri = '/p/' + profile + uri;
            }
            // Search in window's hash (only if 2-nd argument doesn't exist
            else if (arguments.length === 1 && (profile = this.getProfile()) ) {
                uri = '/p/' + profile + uri;
            }
            return uri;
        },

        /**
         * Generates a hash link to a note
         * @param object opt options
         * @param object note a note model or JSON object
         */
        note: function (opt, note) {
            var args = (opt ? _.clone(opt) : {}),
                url = '/notes',
                filters = {
                    filter : '/f/',
                    query  : '/q/',
                    page   : '/p'
                };

            args.page = (typeof note === 'number') ? note : args.page;
            if (isNaN(args.page)) {
                args.page = 0;
            }

            _.each(filters, function (value, filter) {
                if (_.has(args, filter) && args[filter] !== null) {
                    url += value + args[filter];
                }
            });

            // Note
            if (note && _.isObject(note)) {
                url += '/show/' + ( note.id || note.get('id') );
            }

            return this.link(url, args.profile);
        }
    });

    return (instance = (instance || new URI()));
});
